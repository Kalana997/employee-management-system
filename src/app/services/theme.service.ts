import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_KEY = 'app-theme';

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {

    const current = this.getTheme();

    if (current === 'dark') {

      this.setTheme('light');

    } else {

      this.setTheme('dark');

    }

  }

  setTheme(theme: 'dark' | 'light'): void {

    localStorage.setItem(this.THEME_KEY, theme);

    document.body.classList.remove('dark-theme', 'light-theme');

    document.body.classList.add(`${theme}-theme`);

  }

  getTheme(): 'dark' | 'light' {

    return (localStorage.getItem(this.THEME_KEY) as 'dark' | 'light') || 'dark';

  }

  loadTheme(): void {

    this.setTheme(this.getTheme());

  }

  isDarkMode(): boolean {

    return this.getTheme() === 'dark';

  }

}