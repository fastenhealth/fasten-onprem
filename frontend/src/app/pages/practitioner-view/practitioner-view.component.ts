import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FastenApiService } from '../../services/fasten-api.service';
import { Practitioner } from 'src/app/models/fasten/practitioner';

interface ContactDataItem {
  icon: string;
  text: string | string[] | null | undefined;
  label: string;
  key: string;
  side?: string;
  sideColor?: string;
  clampLines?: number | 'none';
  linkAs?: 'email' | 'tel' | 'website';
}

@Component({
  selector: 'app-practitioner-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practitioner-view.component.html',
  styleUrls: ['./practitioner-view.component.scss'] 
})
export class PractitionerViewComponent implements OnInit {
  practitioner: Practitioner | null = null;
  practitionerId: string = '';
  isLoading: boolean = true;
  loadError: string = '';
  isStarred: boolean = false;
  deleteLoading: boolean = false;
  contactData: ContactDataItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fastenApi: FastenApiService
  ) { }

  ngOnInit(): void {
    console.log('PractitionerViewComponent initialized');
    
    this.route.params.subscribe(params => {
      console.log('Route params received:', params);
      this.practitionerId = params['id'];
      console.log('Practitioner ID extracted:', this.practitionerId);
      
      if (this.practitionerId) {
        this.loadPractitioner();
      } else {
        this.loadError = 'No practitioner ID provided';
        this.isLoading = false;
        console.error('No practitioner ID in route params');
      }
    });
  }

  loadPractitioner(): void {
    this.isLoading = true;
    this.loadError = '';
    
    console.log('Loading practitioner with ID:', this.practitionerId);
    
    this.fastenApi.getAllPractitioners().subscribe({
      next: (practitioners: Practitioner[]) => {
        console.log('All practitioners loaded:', practitioners);
        
        this.practitioner = practitioners.find(p => 
          p.source_resource_id === this.practitionerId
        ) || null;
        
        console.log('Found practitioner:', this.practitioner);
        
        if (!this.practitioner) {
          this.loadError = 'Practitioner not found';
        } else {
          // Debug the practitioner data
          this.logPractitionerData();
          
          // Update contact data when practitioner is loaded
          this.contactData = this.getContactData();
          console.log('Contact data generated:', this.contactData);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading practitioner:', error);
        this.loadError = 'Failed to load practitioner details';
        this.isLoading = false;
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/practitioners']);
  }

  editPractitioner(): void {
    this.router.navigate(['/practitioners/edit', this.practitionerId]);
  }

  viewPractitionerHistory(): void {
    // Send practitioner data in state to avoid re-fetching
    this.router.navigate(['/practitioner-history', this.practitionerId], {
      state: { practitioner: this.practitioner }
    });
  }

  toggleStar(): void {
    this.isStarred = !this.isStarred;
    console.log('Practitioner starred:', this.isStarred);
  }

  confirmDeletion(): void {
    if (confirm('Are you sure you want to delete this practitioner? This action cannot be undone.')) {
      this.deletePractitioner();
    }
  }

  deletePractitioner(): void {
    if (!this.practitioner || !this.practitioner.source_resource_id) {
      alert('Cannot delete: No resource ID available for this practitioner');
      return;
    }

    this.deleteLoading = true;

    this.fastenApi.deleteResourceFhir('Practitioner', this.practitioner.source_resource_id).subscribe({
      next: (response) => {
        this.deleteLoading = false;
        if (response && response.success) {
          alert('Practitioner deleted successfully');
          this.navigateBack();
        } else {
          alert('Failed to delete practitioner: ' + (response?.error || 'Unknown error'));
        }
      },
      error: (error) => {
        this.deleteLoading = false;
        console.error('Error deleting practitioner:', error);
        const errorMessage = error?.error?.details || error?.error?.error || error?.message || 'Unknown error';
        alert('Failed to delete practitioner: ' + errorMessage);
      }
    });
  }

  getAvatarUrl(): string {
    return 'https://cdn.quasar.dev/img/avatar.png';
  }

  getProfession(): string {
    if (this.practitioner?.telecom?.system === 'fax') {
      return 'Healthcare Provider';
    }
    return 'Medical Professional';
  }

  getPractitionerTags(): string[] {
    const tags = [];
    
    if (this.practitioner?.address?.state) {
      tags.push(this.practitioner.address.state);
    }
    
    if (this.practitioner?.address?.city) {
      tags.push(this.practitioner.address.city);
    }
    
    if (this.practitioner?.telecom?.system) {
      const system = this.practitioner.telecom.system;
      if (system === 'phone') {
        tags.push('Phone Consultation');
      } else if (system === 'email') {
        tags.push('Email Contact');
      } else if (system === 'fax') {
        tags.push('Fax Available');
      }
    }
    
    return tags.length > 0 ? tags : ['Healthcare Provider', 'General Practice'];
  }

  getContactData(): ContactDataItem[] {
    if (!this.practitioner) {
      console.log('No practitioner data available');
      return [];
    }

    console.log('Generating contact data for practitioner:', this.practitioner);

    const contactItems: ContactDataItem[] = [
      // Always show the practitioner name as a contact item
      {
        icon: 'user',
        text: this.practitioner.full_name || 'Unknown Practitioner',
        label: 'Name',
        key: 'full_name'
      },
      // Primary contact method (whatever system is available)
      {
        icon: this.getContactIcon(this.practitioner.telecom?.system),
        text: this.practitioner.telecom?.value || null,
        label: this.getContactLabel(this.practitioner.telecom?.system),
        side: this.practitioner.telecom?.use || 'work',
        sideColor: 'primary',
        key: 'primary_contact',
        linkAs: this.getLinkType(this.practitioner.telecom?.system)
      },
      // Address information
      {
        icon: 'map-marker-alt',
        text: this.getAddressLines(),
        label: 'Address',
        key: 'address'
      },
      // Formatted address (if available and different)
      {
        icon: 'location-arrow',
        text: this.practitioner.formattedAddress || null,
        label: 'Formatted Address',
        key: 'formatted_address'
      },
      // Formatted telecom (if available and different)
      {
        icon: 'address-card',
        text: this.practitioner.formattedTelecom || null,
        label: 'Contact Info',
        key: 'formatted_telecom'
      },
      // Resource information (for debug/admin purposes)
      {
        icon: 'id-card',
        text: this.practitioner.source_resource_id || null,
        label: 'Resource ID',
        key: 'resource_id'
      }
    ];

    console.log('Raw contact items:', contactItems);
    
    const filteredItems = contactItems.filter(item => {
      const isValid = this.hasValidData(item);
      console.log(`Item ${item.key} - Valid: ${isValid}, Text:`, item.text);
      return isValid;
    });
    
    console.log('Filtered contact items:', filteredItems);
    return filteredItems;
  }

  private getContactIcon(system: string | undefined): string {
    switch (system) {
      case 'phone': return 'phone';
      case 'email': return 'envelope';
      case 'fax': return 'fax';
      case 'url': return 'globe';
      case 'sms': return 'sms';
      default: return 'phone';
    }
  }

  private getContactLabel(system: string | undefined): string {
    switch (system) {
      case 'phone': return 'Phone Number';
      case 'email': return 'Email Address';
      case 'fax': return 'Fax Number';
      case 'url': return 'Website';
      case 'sms': return 'SMS Number';
      default: return 'Contact';
    }
  }

  private getLinkType(system: string | undefined): 'email' | 'tel' | 'website' | undefined {
    switch (system) {
      case 'phone':
      case 'fax':
      case 'sms':
        return 'tel';
      case 'email':
        return 'email';
      case 'url':
        return 'website';
      default:
        return undefined;
    }
  }

  private getFormattedAddressString(): string {
    if (!this.practitioner?.address) return '';
    
    const parts = [];
    
    if (this.practitioner.address.line) {
      parts.push(...this.practitioner.address.line.filter(line => line));
    }
    
    const cityStateZip = [
      this.practitioner.address.city,
      this.practitioner.address.state,
      this.practitioner.address.postalCode
    ].filter(part => part).join(', ');
    
    if (cityStateZip) parts.push(cityStateZip);
    if (this.practitioner.address.country) parts.push(this.practitioner.address.country);
    
    return parts.join(', ');
  }

  private getAddressLines(): string[] | null {
    if (!this.practitioner?.address) return null;
    
    const lines = [];
    
    if (this.practitioner.address.line && this.practitioner.address.line.length > 0) {
      lines.push(...this.practitioner.address.line.filter(line => line && line.trim()));
    }
    
    const cityStateZip = [
      this.practitioner.address.city,
      this.practitioner.address.state,
      this.practitioner.address.postalCode
    ].filter(part => part && part.trim()).join(', ');
    
    if (cityStateZip) {
      lines.push(cityStateZip);
    }
    
    if (this.practitioner.address.country && this.practitioner.address.country.trim()) {
      lines.push(this.practitioner.address.country);
    }
    
    return lines.length > 0 ? lines : null;
  }

  hasValidData(item: ContactDataItem): boolean {
    if (!item.text) return false;
    
    if (typeof item.text === 'string') {
      return item.text.trim().length > 0;
    }
    
    if (Array.isArray(item.text)) {
      return item.text.some(line => line && line.trim().length > 0);
    }
    
    return false;
  }

  getFilteredLines(lines: string[]): string[] {
    return lines.filter(line => line && line.trim().length > 0);
  }

  getActionLink(item: ContactDataItem): string {
    if (!item.linkAs || !item.text) return '#';
    
    const text = typeof item.text === 'string' ? item.text : item.text.join(' ');
    
    switch (item.linkAs) {
      case 'email':
        return `mailto:${text}`;
      case 'tel':
        return `tel:${text}`;
      case 'website':
        return text.startsWith('http') ? text : `https://${text}`;
      default:
        return '#';
    }
  }

  // Template helper methods
  isString(value: any): boolean {
    return typeof value === 'string';
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  hasContactData(): boolean {
    return this.contactData.length > 0;
  }

  hasNoContactData(): boolean {
    console.log('Checking if no contact data. Contact data length:', this.contactData.length);
    return this.contactData.length === 0;
  }

  getContactItemText(item: ContactDataItem): string {
    return this.isString(item.text) ? item.text as string : '';
  }

  getContactItemArray(item: ContactDataItem): string[] {
    return this.isArray(item.text) ? item.text as string[] : [];
  }

  getSideColorClass(item: ContactDataItem): string {
    return 'bg-' + (item.sideColor || 'secondary');
  }

  // Debug method to see all available data
  logPractitionerData(): void {
    if (this.practitioner) {
      console.log('=== PRACTITIONER DEBUG INFO ===');
      console.log('Full practitioner object:', this.practitioner);
      console.log('Telecom data:', this.practitioner.telecom);
      console.log('Address data:', this.practitioner.address);
      console.log('Formatted address:', this.practitioner.formattedAddress);
      console.log('Formatted telecom:', this.practitioner.formattedTelecom);
      console.log('Source resource ID:', this.practitioner.source_resource_id);
      console.log('=== END DEBUG INFO ===');
    }
  } 

  getInitials(): string {
    if (!this.practitioner?.full_name) return 'U';
    
    const names = this.practitioner.full_name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getEmailAddress(): string | null {
    return this.practitioner?.email || null;
  }

  getPhoneNumber(): string | null {
    return this.practitioner?.phone || null;
  }

  getFormattedAddress(): string | null {
    if (!this.practitioner?.address) return null;
    
    const parts = [];
    
    if (this.practitioner.address.line) {
      parts.push(...this.practitioner.address.line.filter(line => line?.trim()));
    }
    
    const cityStateZip = [
      this.practitioner.address.city,
      this.practitioner.address.state,
      this.practitioner.address.postalCode
    ].filter(part => part?.trim()).join(', ');
    
    if (cityStateZip) parts.push(cityStateZip);
    if (this.practitioner.address.country?.trim()) parts.push(this.practitioner.address.country);
    
    return parts.length > 0 ? parts.join(', ') : null;
  }

  hasAnyContactInfo(): boolean {
    return !!(
      this.getEmailAddress() || 
      this.getPhoneNumber() || 
      this.getFormattedAddress() ||
      this.practitioner?.source_resource_id
    );
  }

  getFormattedDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  openEmail(): void {
    const email = this.getEmailAddress();
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    }
  }

  makeCall(): void {
    const phone = this.getPhoneNumber();
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
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
}