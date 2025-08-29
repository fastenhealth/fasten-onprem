import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FastenApiService } from '../../services/fasten-api.service';
import { Practitioner } from 'src/app/models/fasten/practitioner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
export interface Favorite {
  id: string; // From ModelBase
  created_at: string; // ISO date string
  updated_at: string; // ISO date string (optional if not used)
  user_id: string;
  resource_type: string;
  resource_id: string;
  CreatedAt: string; // duplicate of created_at, possibly for legacy reasons
}

@Component({
  selector: 'app-practitioner-list',
  templateUrl: './practitioner-list.component.html',
  styleUrls: ['./practitioner-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PractitionerListComponent implements OnInit, OnDestroy {
  practitioners: Practitioner[] = [];
  filteredPractitioners: Practitioner[] = [];
  selectedPractitioners: Practitioner[] = [];
  loading: boolean = false;
  isHoverable: boolean = false;
  isTouchEnabled: boolean = false;
  searchTerm: string = '';
  showSelectionDropdown: boolean = false;
  showActionsDropdown: boolean = false;
  favoriteIds: Set<string> = new Set();
  favoritePractitioners: Practitioner[] = [];
  filterType: 'all' | 'favorites' = 'all';
  currentLetter: string = 'A';
  isScrolling: boolean = false;
  private scrollTimeout: any;
  showPractitionerDropdown: string | null = null;

  constructor(
    private fastenApi: FastenApiService, 
    private modalService: NgbModal, 
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPractitioners();
    this.checkDeviceCapabilities();
    this.loadFavorites();
  }

  private checkDeviceCapabilities(): void {
    this.isHoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.isTouchEnabled = window.matchMedia('(any-pointer: coarse)').matches;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkDeviceCapabilities();
  }

  loadPractitioners(): void {
    this.loading = true;
    this.fastenApi.getAllPractitioners().subscribe(
      (practitioners: Practitioner[]) => {
        this.practitioners = practitioners;
        this.updatePractitionersFavoriteStatus();
        this.loading = false;
      },
      error => {
        console.error('Error loading practitioners:', error);
        this.loading = false;
      }
    );
  }

  loadFavorites(): void {
    this.fastenApi.getUserFavorites('Practitioner').subscribe(
      (favorites: Favorite[]) => {
        this.favoriteIds = new Set(favorites.map(fav => fav?.resource_id || ''));
        this.updatePractitionersFavoriteStatus();
      },
      error => {
        console.error('Error loading favorites:', error);
      }
    );
  }
  
  updatePractitionersFavoriteStatus(): void {
    this.practitioners.forEach(practitioner => {
      practitioner.isFavorite = this.favoriteIds.has(practitioner.source_resource_id || '');
    });
    this.sortPractitioners();
  }

  hasFavorites(): boolean {
    return this.filteredPractitioners.some(p => p.isFavorite);
  }

  // Toggle favorite status
  toggleFavorite(practitioner: Practitioner, event: Event): void {
    event.stopPropagation(); // Prevent row selection
    
    const resourceId = practitioner.source_resource_id;
    const sourceId = practitioner.source_id;
    if (!resourceId) return;

    const wasFavorite = practitioner.isFavorite;
    
    // Optimistic update
    practitioner.isFavorite = !wasFavorite;
    
    if (wasFavorite) {
      this.favoriteIds.delete(resourceId);
    } else {
      this.favoriteIds.add(resourceId);
    }
    
    // Update backend
    const request = wasFavorite 
      ? this.fastenApi.removeFavorite('Practitioner', resourceId, sourceId)
      : this.fastenApi.addFavorite('Practitioner', resourceId, sourceId);
    
    request.subscribe(
      () => {
        console.log(`Practitioner ${wasFavorite ? 'removed from' : 'added to'} favorites`);
        this.sortPractitioners(); // Re-sort to move favorites to top
        
        // Add visual feedback
        const button = (event.target as HTMLElement).closest('.favorite-btn');
        if (button) {
          button.classList.add('just-favorited');
          setTimeout(() => {
            button.classList.remove('just-favorited');
          }, 300);
        }
      },
      error => {
        // Revert on error
        practitioner.isFavorite = wasFavorite;
        if (wasFavorite) {
          this.favoriteIds.add(resourceId);
        } else {
          this.favoriteIds.delete(resourceId);
        }
        console.error('Error updating favorite:', error);
        alert('Failed to update favorite. Please try again.');
      }
    );
  }

  // Sort practitioners with favorites on top
  sortPractitioners(): void {
    this.practitioners.sort((a, b) => {
      // First, sort by favorite status (favorites first)
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Then sort alphabetically by name
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
    
    this.applyFilters(); // Re-apply any active filters
  }

  // Get favorite icon class
  getFavoriteIconClass(practitioner: Practitioner): string {
    return practitioner.isFavorite ? 'fas fa-star text-warning' : 'far fa-star text-muted';
  }

  // Get favorite button title
  getFavoriteTitle(practitioner: Practitioner): string {
    return practitioner.isFavorite ? 'Remove from favorites' : 'Add to favorites';
  }

  // Get favorites count for UI
  getFavoritesCount(): number {
    return this.practitioners.filter(p => p.isFavorite).length;
  }

  getFavorites(): any[] {
    return this.filteredPractitioners.filter(p => p.isFavorite);
  }
  
  getNonFavorites(): any[] {
    return this.filteredPractitioners.filter(p => !p.isFavorite);
  }

  // Export only favorites
  exportFavoritesToCSV(): void {
    const originalSelection = [...this.selectedPractitioners];
    this.selectedPractitioners = this.practitioners.filter(p => p.isFavorite);
    
    if (this.selectedPractitioners.length === 0) {
      alert('No favorite practitioners to export.');
      this.selectedPractitioners = originalSelection;
      return;
    }
    
    this.exportToCSV();
    this.selectedPractitioners = originalSelection; // Restore original selection
  }

  // Quick actions for favorites
  favoriteAll(): void {
    const unfavorited = this.filteredPractitioners.filter(p => !p.isFavorite);
    unfavorited.forEach(practitioner => {
      const resourceId = practitioner.source_resource_id;
      if (resourceId) {
        practitioner.isFavorite = true;
        this.favoriteIds.add(resourceId);
      }
    });

    // Batch update to backend
    const requests = unfavorited
      .filter(p => p.source_resource_id)
      .map(p => this.fastenApi.addFavorite('Practitioner', p.source_resource_id!, p.source_id!));
    
    if (requests.length > 0) {
      forkJoin(requests).subscribe(
        () => {
          console.log('All visible practitioners added to favorites');
          this.sortPractitioners();
        },
        error => {
          console.error('Error batch adding favorites:', error);
          // Revert changes on error
          unfavorited.forEach(p => {
            p.isFavorite = false;
            if (p.source_resource_id) {
              this.favoriteIds.delete(p.source_resource_id);
            }
          });
          alert('Failed to add all favorites. Please try again.');
        }
      );
    }
  }

  // Remove all favorites
  unfavoriteAll(): void {
    const favorited = this.practitioners.filter(p => p.isFavorite);
    favorited.forEach(practitioner => {
      const resourceId = practitioner.source_resource_id;
      if (resourceId) {
        practitioner.isFavorite = false;
        this.favoriteIds.delete(resourceId);
      }
    });

    // Batch update to backend
    const requests = favorited
      .filter(p => p.source_resource_id)
      .map(p => this.fastenApi.removeFavorite('Practitioner', p.source_resource_id!, p.source_id!));
    
    if (requests.length > 0) {
      forkJoin(requests).subscribe(
        () => {
          console.log('All favorites removed');
          this.sortPractitioners();
        },
        error => {
          console.error('Error batch removing favorites:', error);
          // Revert changes on error
          favorited.forEach(p => {
            p.isFavorite = true;
            if (p.source_resource_id) {
              this.favoriteIds.add(p.source_resource_id);
            }
          });
          alert('Failed to remove all favorites. Please try again.');
        }
      );
    }
  }

  // Search functionality
  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // Apply all filters (search + favorites)
  applyFilters(): void {
    let filtered = [...this.practitioners];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(practitioner => 
        practitioner.full_name?.toLowerCase().includes(searchLower) ||
        practitioner.email?.toLowerCase().includes(searchLower) ||
        practitioner.phone?.includes(this.searchTerm) ||
        practitioner.jobTitle?.toLowerCase().includes(searchLower) ||
        practitioner.organization?.toLowerCase().includes(searchLower) ||
        practitioner.address?.city?.toLowerCase().includes(searchLower) ||
        practitioner.address?.state?.toLowerCase().includes(searchLower) ||
        practitioner.fax?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply favorites filter
    if (this.filterType === 'favorites') {
      filtered = filtered.filter(practitioner => practitioner.isFavorite);
    }
    
    this.filteredPractitioners = filtered;
  }

  // Legacy method for backward compatibility
  private filterPractitioners(): void {
    this.applyFilters();
  }

  // Selection Management
  isSelected(practitioner: Practitioner): boolean {
    return this.selectedPractitioners.some(p => 
      p.source_resource_id === practitioner.source_resource_id
    );
  }

  toggleSelection(practitioner: Practitioner): void {
    if (this.isSelected(practitioner)) {
      this.selectedPractitioners = this.selectedPractitioners.filter(p => 
        p.source_resource_id !== practitioner.source_resource_id
      );
    } else {
      this.selectedPractitioners.push(practitioner);
    }
  }

  isAllSelected(): boolean {
    return this.filteredPractitioners.length > 0 && 
           this.selectedPractitioners.length === this.filteredPractitioners.length;
  }

  isIndeterminate(): boolean {
    return this.selectedPractitioners.length > 0 && 
           this.selectedPractitioners.length < this.filteredPractitioners.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedPractitioners = [];
    } else {
      this.selectedPractitioners = [...this.filteredPractitioners];
    }
  }

  // Row Click Handler
  onRowClick(practitioner: Practitioner): void {
    console.log('Row clicked, practitioner:', practitioner);
    console.log('Source resource ID:', practitioner.source_resource_id);
    
    if (practitioner.source_resource_id) {
      console.log('Navigating to:', ['/practitioners/view', practitioner.source_resource_id]);
      this.router.navigate(['/practitioners/view', practitioner.source_resource_id]);
    } else {
      console.error('No source_resource_id found for practitioner:', practitioner);
      alert('Cannot view practitioner: No ID available');
    }
  }

  // Action Handlers
  editPractitioner(event: MouseEvent, practitioner: Practitioner): void {
    event.stopPropagation();
    event.preventDefault();
    
    // For now, just open the view page - you can add edit functionality later
    this.router.navigate(['/practitioners/view', practitioner.source_resource_id]);
  }

  showMoreActions(event: MouseEvent, practitioner: Practitioner): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Implement dropdown menu or context menu
    console.log('More actions for:', practitioner.full_name);
  }

  // Utility Methods
  trackByPractitioner(index: number, practitioner: Practitioner): string {
    return practitioner.source_resource_id || index.toString();
  }

  // Navigate to add practitioner page
  navigateToAddPractitioner(): void {
    this.router.navigate(['/practitioners/new']);
  }

  exportToCSV(): void {
    if (this.selectedPractitioners.length === 0) {
      alert('Please select at least one practitioner to export.');
      return;
    }
  
    try {
      // Define CSV headers
      const headers = [
        'First Name',
        'Organization Name',
        'Organization Title',
        'Labels',
        'E-mail 1 - Label',
        'E-mail 1 - Value',
        'Phone 1 - Label',
        'Phone 1 - Value',
        'Address 1 - Formatted',
        'Address 1 - City',
        'Address 1 - Region',
        'Address 1 - Postal Code',
        'Address 1 - Country',
        'Source Resource ID',
        'Export Date'
      ];
  
      // Convert practitioners to CSV rows
      const csvRows = [];
      
      // Add header row
      csvRows.push(headers.join(','));
      
      // Add data rows
      this.selectedPractitioners.forEach(practitioner => {
        const row = [
          this.escapeCsvValue(practitioner.full_name || ''),
          this.escapeCsvValue(practitioner.organization || ''),
          this.escapeCsvValue(practitioner.jobTitle || ''),
          this.escapeCsvValue('Fasten Health'),
          this.escapeCsvValue(practitioner.emailUse),
          this.escapeCsvValue(practitioner.email),
          this.escapeCsvValue(practitioner.phoneUse),
          this.escapeCsvValue(practitioner.phone),
          this.escapeCsvValue((practitioner.address?.line || []).filter(line => line && line.trim()).join(', ')),
          this.escapeCsvValue(practitioner.address?.city || ''),
          this.escapeCsvValue(practitioner.address?.country || ''),
          this.escapeCsvValue(practitioner.address?.postalCode || ''),
          this.escapeCsvValue(practitioner.address?.state || ''),
          this.escapeCsvValue(practitioner.source_resource_id || ''),
          this.escapeCsvValue(new Date().toISOString().split('T')[0])
        ];
        
        csvRows.push(row.join(','));
      });
  
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create and download file
      this.downloadCSV(csvContent, this.generateFileName());
      
      // Optional: Clear selection after export
      this.selectedPractitioners = [];
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  }
  
  // Helper method to escape CSV values (handle commas, quotes, newlines)
  private escapeCsvValue(value: string): string {
    if (!value) return '""';
    
    // Convert to string and trim
    const stringValue = String(value).trim();
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
  }
  
  // Helper method to generate filename with timestamp
  private generateFileName(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const count = this.selectedPractitioners.length;
    
    return `practitioners-export-${count}-items-${dateStr}-${timeStr}.csv`;
  }
  
  // Helper method to trigger file download
  private downloadCSV(csvContent: string, fileName: string): void {
    // Create a Blob with UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log(`Exported ${this.selectedPractitioners.length} practitioners to ${fileName}`);
  }

  copyToClipboard(text: string, type: 'email' | 'phone', event: Event): void {
    // Prevent the click from bubbling up to the row click handler
    event.stopPropagation();
    event.preventDefault();
    
    if (!text) return;

    // Use the modern Clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        this.showCopyFeedback(type);
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        // Fallback to the older method
        this.fallbackCopyToClipboard(text, type);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      this.fallbackCopyToClipboard(text, type);
    }
  }

  private fallbackCopyToClipboard(text: string, type: 'email' | 'phone'): void {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopyFeedback(type);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert(`Failed to copy ${type}. Please copy manually: ${text}`);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private showCopyFeedback(type: 'email' | 'phone'): void {
    // Optional: Show a brief success message
    // You can implement a toast notification here
    console.log(`${type} copied to clipboard!`);
    
    // Optional: You could show a temporary tooltip or change the icon briefly
    // For now, we'll just log it, but you could add visual feedback here
  }

  selectAll(): void {
    this.selectedPractitioners = [...this.filteredPractitioners];
  }

  selectNone(): void {
    this.selectedPractitioners = [];
  }

  // Dropdown toggle methods
  toggleSelectionDropdown(): void {
    this.showSelectionDropdown = !this.showSelectionDropdown;
    if (this.showSelectionDropdown) {
      this.showActionsDropdown = false; // Close other dropdown
      // Add click listener to close on outside click
      setTimeout(() => this.addClickOutsideListener('selection'), 0);
    }
  }

  toggleActionsDropdown(): void {
    this.showActionsDropdown = !this.showActionsDropdown;
    if (this.showActionsDropdown) {
      this.showSelectionDropdown = false; // Close other dropdown
      // Add click listener to close on outside click
      setTimeout(() => this.addClickOutsideListener('actions'), 0);
    }
  }

  hideSelectionDropdown(): void {
    this.showSelectionDropdown = false;
    this.removeClickOutsideListener();
  }

  hideActionsDropdown(): void {
    this.showActionsDropdown = false;
    this.removeClickOutsideListener();
  }

  private clickOutsideListener?: (event: Event) => void;

  private removeClickOutsideListener(): void {
    if (this.clickOutsideListener) {
      document.removeEventListener('click', this.clickOutsideListener);
      this.clickOutsideListener = undefined;
    }
  }

  // Don't forget to cleanup on destroy
  ngOnDestroy(): void {
    this.removeClickOutsideListener();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  deleteSelectedPractitioners(): void {
    if (this.selectedPractitioners.length === 0) {
      alert('No practitioners selected for deletion.');
      return;
    }

    const count = this.selectedPractitioners.length;
    const confirmMessage = `Are you sure you want to delete ${count} practitioner${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Create an array of delete operations
    const deleteOperations = this.selectedPractitioners.map(practitioner => 
      this.fastenApi.deleteResourceFhir('Practitioner', practitioner.source_resource_id!)
    );

    // Show loading state (you might want to add a loading indicator)
    let deletedCount = 0;
    let failedCount = 0;

    // Execute all delete operations
    deleteOperations.forEach((deleteOp, index) => {
      deleteOp.subscribe({
        next: (response) => {
          if (response && response.success) {
            deletedCount++;
          } else {
            failedCount++;
          }

          // Check if this is the last operation
          if (deletedCount + failedCount === deleteOperations.length) {
            this.handleBatchDeleteComplete(deletedCount, failedCount);
          }
        },
        error: (error) => {
          console.error('Error deleting practitioner:', error);
          failedCount++;

          // Check if this is the last operation
          if (deletedCount + failedCount === deleteOperations.length) {
            this.handleBatchDeleteComplete(deletedCount, failedCount);
          }
        }
      });
    });
  }

  private handleBatchDeleteComplete(deletedCount: number, failedCount: number): void {
    // Remove successfully deleted practitioners from the local arrays
    if (deletedCount > 0) {
      const deletedIds = this.selectedPractitioners
        .slice(0, deletedCount)
        .map(p => p.source_resource_id);
      
      this.practitioners = this.practitioners.filter(p => 
        !deletedIds.includes(p.source_resource_id)
      );
      this.applyFilters(); // Refresh filtered list
    }

    // Clear selection
    this.selectedPractitioners = [];

    // Show results
    if (failedCount === 0) {
      alert(`Successfully deleted ${deletedCount} practitioner${deletedCount > 1 ? 's' : ''}.`);
    } else if (deletedCount === 0) {
      alert(`Failed to delete practitioners. Please try again.`);
    } else {
      alert(`Deleted ${deletedCount} practitioner${deletedCount > 1 ? 's' : ''}, but ${failedCount} failed. Please refresh the page.`);
    }

    // Optionally reload the full list to ensure consistency
    if (deletedCount > 0) {
      this.loadPractitioners();
    }
  }

  getJobTitleFromQualification(practitioner: Practitioner): string {
    if (!practitioner.qualification || !Array.isArray(practitioner.qualification)) {
      return '';
    }

    const firstQualification = practitioner.qualification[0];
    
    // Try to get from code.coding.display
    if (firstQualification?.code?.coding) {
      const coding = firstQualification.code.coding[0];
      if (coding?.display) {
        return coding.display;
      }
      if (coding?.code) {
        return coding.code;
      }
    }
    
    // Try to get from code.text
    if (firstQualification?.code?.text) {
      return firstQualification.code.text;
    }
    
    // Fallback to a generic title
    return 'Healthcare Provider';
  }

    // Alphabetical scrollbar methods
    onTableScroll(event: Event): void {
      const scrollElement = event.target as HTMLElement;
      
      // Show the letter indicator
      this.isScrolling = true;
      
      // Clear existing timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // Hide the indicator after scrolling stops
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 1500);
  
      // Calculate current letter based on scroll position
      if (this.filteredPractitioners.length > 0) {
        const scrollTop = scrollElement.scrollTop;
        const rowHeight = 60; // Approximate row height
        const currentIndex = Math.floor(scrollTop / rowHeight);
        
        // Ensure we don't go out of bounds
        const safeIndex = Math.min(currentIndex, this.filteredPractitioners.length - 1);
        const currentPractitioner = this.filteredPractitioners[safeIndex];
        
        if (currentPractitioner?.full_name) {
          const firstLetter = currentPractitioner.full_name.charAt(0).toUpperCase();
          // Only update if it's a valid letter
          if (firstLetter.match(/[A-Z]/)) {
            this.currentLetter = firstLetter;
          }
        }
      }
    }
  
    // Individual practitioner dropdown methods
    showPractitionerActions(event: MouseEvent, practitioner: Practitioner): void {
      event.stopPropagation();
      event.preventDefault();
      
      // Toggle dropdown for this specific practitioner
      if (this.showPractitionerDropdown === practitioner.source_resource_id) {
        this.hidePractitionerDropdown();
      } else {
        this.showPractitionerDropdown = practitioner.source_resource_id || null;
        // Add click listener to close on outside click
        setTimeout(() => this.addClickOutsideListener('practitioner'), 0);
      }
    }
  
    hidePractitionerDropdown(): void {
      this.showPractitionerDropdown = null;
      this.removeClickOutsideListener();
    }
  
    exportSinglePractitioner(practitioner: Practitioner): void {

      if (event) {
        event.stopPropagation(); // Prevent row click
        event.preventDefault();
      }
      
      // Close the dropdown
      this.hidePractitionerDropdown();

      // Temporarily set selection to just this practitioner
      const originalSelection = [...this.selectedPractitioners];
      this.selectedPractitioners = [practitioner];
      
      // Export CSV
      this.exportToCSV();
      
      // Restore original selection
      this.selectedPractitioners = originalSelection;
    }
  
    deleteSinglePractitioner(practitioner: Practitioner): void {

      if (event) {
        event.stopPropagation(); // Prevent row click
        event.preventDefault(); // Prevent any default behavior
      }
      
      // Close the dropdown
      this.hidePractitionerDropdown();

      const confirmMessage = `Are you sure you want to delete ${practitioner.full_name}? This action cannot be undone.`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
  
      this.fastenApi.deleteResourceFhir('Practitioner', practitioner.source_resource_id!).subscribe({
        next: (response) => {
          if (response && response.success) {
            // Remove from local arrays
            this.practitioners = this.practitioners.filter(p => 
              p.source_resource_id !== practitioner.source_resource_id
            );
            this.applyFilters(); // Refresh filtered list
            
            alert(`Successfully deleted ${practitioner.full_name}.`);
          } else {
            alert('Failed to delete practitioner. Please try again.');
          }
        },
        error: (error) => {
          console.error('Error deleting practitioner:', error);
          alert('Failed to delete practitioner. Please try again.');
        }
      });
    }
  
    // Updated click outside listener to handle practitioner dropdowns
    private addClickOutsideListener(type: 'selection' | 'actions' | 'practitioner'): void {
      this.removeClickOutsideListener(); // Remove existing listener
      
      this.clickOutsideListener = (event: Event) => {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('.dropdown');
        
        if (!dropdown) {
          if (type === 'selection') {
            this.hideSelectionDropdown();
          } else if (type === 'actions') {
            this.hideActionsDropdown();
          } else if (type === 'practitioner') {
            this.hidePractitionerDropdown();
          }
        }
      };
      
      document.addEventListener('click', this.clickOutsideListener);
    }
  
    // Update the existing mouse events to respect selection state
    onMouseEnter(event: MouseEvent): void {
      if (this.isHoverable && this.selectedPractitioners.length === 0) {
        const row = event.currentTarget as HTMLElement;
        const actions = row.querySelector('.action-buttons') as HTMLElement;
        
        if (actions && !actions.classList.contains('hidden')) {
          actions.style.visibility = 'visible';
          actions.style.opacity = '1';
        }
      }
    }
  
    onMouseLeave(event: MouseEvent): void {
      if (this.isHoverable) {
        const row = event.currentTarget as HTMLElement;
        const actions = row.querySelector('.action-buttons') as HTMLElement;
        
        if (actions) {
          actions.style.visibility = 'hidden';
          actions.style.opacity = '0';
        }
      }
    }
}