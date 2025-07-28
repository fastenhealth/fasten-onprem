import { LoginPage } from './pages/login.po';
import { SourcesPage } from './pages/sources.po';
import {DashboardPage} from './pages/dashboard.po';
import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import * as path from 'path';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe('🔐 Auth Signin Page', () => {
  let loginPage: LoginPage;
  let sourcesPage: SourcesPage;
  let dashboard: DashboardPage

  beforeAll(async () => {
    loginPage = new LoginPage();
    sourcesPage = new SourcesPage();
    dashboard = new DashboardPage();

    await browser.driver.manage().window().maximize();
    await browser.waitForAngularEnabled(true);

    await loginPage.navigateTo();

    console.log('🔎 Navigated to login page:', await browser.getCurrentUrl());

    // Wait for login input field before proceeding
    await browser.wait(
      EC.presenceOf(loginPage.getUsernameInput()),
      5000,
      'Username input not found'
    );

    await loginPage.login('user', 'test@test.com');

    // Wait for dashboard to be visible
    await browser.wait(
      EC.visibilityOf(loginPage.getWelcomeMessage()),
      5000,
      'Dashboard not loaded'
    );
  });

  describe('🔐 Login flow', () => {
    it('should show welcome message after login', async () => {
      const currentUrl = await browser.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');

      const messageText = await loginPage.getWelcomeMessage().getText();
      expect(messageText).toContain('Welcome back!');
    });
  });

  describe('📁 Sources Upload flow', () => {
    it('should navigate to Sources page and upload a file', async () => {
      console.log('➡️  Clicking on the Sources link');
      await sourcesPage.clickOnSourcesLink();

      const sourcesUrl = await browser.getCurrentUrl();
      console.log(`📍 Current URL: ${sourcesUrl}`);
      expect(sourcesUrl).toContain('/sources');

      const filePath = path.resolve(
        __dirname,
        '../data/Letha284_Haag279_b9a32653-9fde-401f-bb32-9932e680c456.json'
      );
      console.log('📁 Uploading file:', filePath);

      await sourcesPage.uploadFile(filePath);

      //await browser.sleep(6000)

     //console.log('🔔 Opening notification dropdown');
     // await sourcesPage.openNotificationsDropdown();
      
     // console.log('🕓 Clicking View History');
      //await sourcesPage.clickOnViewHistory();

    
    });
  });
});


