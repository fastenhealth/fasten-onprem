import { LoginPage } from './pages/login.po';
import { SourcesPage } from './pages/sources.po';
import { browser, ExpectedConditions as EC } from 'protractor';
import * as path from 'path';

describe('Auth Signin Page', () => {
  let loginPage: LoginPage;
  let sourcesPage: SourcesPage;

  beforeAll(async () => {
    loginPage = new LoginPage();
    sourcesPage = new SourcesPage();

    await browser.driver.manage().window().maximize();

    await loginPage.navigateTo();
    await loginPage.login('beatrix', 'beatrix@beatrix.ro');

    // așteaptă dashboard-ul
    await browser.wait(
      EC.visibilityOf(loginPage.getWelcomeMessage()),
      5000,
      'Dashboard not loaded'
    );
  });

  it('should show welcome message after login', async () => {
    const currentUrl = await browser.getCurrentUrl();
    expect(currentUrl).toContain('/dashboard');

    const messageText = await loginPage.getWelcomeMessage().getText();
    expect(messageText).toContain('Welcome back!');
  });

  it('should navigate to Sources page and upload file', async () => {
    await sourcesPage.clickOnSourcesLink();

    const sourcesUrl = await browser.getCurrentUrl();
    expect(sourcesUrl).toContain('/sources');

    const filePath = path.resolve(__dirname, '../data/Aaron697_Brekke496_2fa15bc7-8866-461a-9000-f739e425860a.json');

    await sourcesPage.uploadFile(filePath);
  });
});
