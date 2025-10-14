import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode: BehaviorSubject<boolean>;
  isDarkMode$: Observable<boolean>;

  constructor() {
    const initialTheme = this.getInitialTheme();
    this.darkMode = new BehaviorSubject<boolean>(initialTheme);
    this.isDarkMode$ = this.darkMode.asObservable();
    
    this.applyTheme(initialTheme);
    
    this.listenToSystemThemeChanges();
  }

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPreference;
  }

  private listenToSystemThemeChanges(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === null) {
        this.setDarkMode(e.matches);
      }
    });
  }

  private applyTheme(isDarkMode: boolean): void {
    
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }
    }
  }

  setDarkMode(isDarkMode: boolean): void {
    
    this.darkMode.next(isDarkMode);
    this.applyTheme(isDarkMode);
    
    localStorage.setItem('darkMode', isDarkMode.toString());
  }

  toggleDarkMode(): void {
    const currentValue = this.darkMode.value;
    this.setDarkMode(!currentValue);
  }

  getCurrentTheme(): boolean {
    return this.darkMode.value;
  }

  resetToSystemPreference(): void {
    localStorage.removeItem('darkMode');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(systemPreference);
  }

  hasUserPreference(): boolean {
    return localStorage.getItem('darkMode') !== null;
  }
}