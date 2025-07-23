import { element, by, ElementFinder, browser, ExpectedConditions as EC } from 'protractor';

/**
 * Page Object pentru pagina Sources
 */
export class SourcesPage {
  /**
   * Returnează linkul către /sources din dashboard
   */
  getSourcesLink(): ElementFinder {
    return element(by.css('a.nav-link[routerlink="/sources"]'));
  }

  getFileInput(): ElementFinder {
  return element(by.css('ngx-dropzone input[type="file"]'));
}

  /**
   * Face click pe linkul /sources și așteaptă să fie vizibil și clickabil
   */
  async clickOnSourcesLink(): Promise<void> {
    const link = this.getSourcesLink();

    // așteaptă să fie vizibil
    await browser.wait(
      EC.visibilityOf(link),
      10000,
      'Sources link not visible'
    );

    // așteaptă să fie clickable
    await browser.wait(
      EC.elementToBeClickable(link),
      10000,
      'Sources link not clickable'
    );

    await link.click();
  }

  async uploadFile(filePath: string): Promise<void> {
  const fileInput = this.getFileInput();
  await browser.wait(
    EC.presenceOf(fileInput),
    5000,
    'File input not present'
  );
  await fileInput.sendKeys(filePath);
}
}
