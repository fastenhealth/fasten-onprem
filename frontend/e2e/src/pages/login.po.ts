import { browser, by, element, ElementFinder } from 'protractor';

export class LoginPage {
  navigateTo() {
    return browser.get('/auth/signin');
  }

  getUsernameInput(): ElementFinder {
    return element(by.css('input[name="username"]'));
  }

  getPasswordInput(): ElementFinder {
    return element(by.css('input[name="password"]'));
  }

  getSubmitButton(): ElementFinder {
    return element(by.css('button[type="submit"]'));
  }

  async login(username: string, password: string) {
    await this.getUsernameInput().sendKeys(username);
    await this.getPasswordInput().sendKeys(password);
    await this.getSubmitButton().click();
  }

  getWelcomeMessage(): ElementFinder {
    return element(by.css('.az-dashboard-title'))
  }
}
