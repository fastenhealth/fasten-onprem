// @ts-check
const { test, expect } = require('@playwright/test');

test('BstackDemo Add to cart', async ({ page },testInfo) => {

try{

  await page.evaluate(_ => {},`browserstack_executor: ${JSON.stringify({action: "setSessionName", arguments: {name:testInfo.project.name}})}`);
  await page.waitForTimeout(5000);

  await page.goto('https://www.bstackdemo.com/',{ waitUntil: 'networkidle' });
  await page.locator('[id="\\32 "]').getByText('Add to cart').click();
  await page.getByText('Checkout').click();
  await page.locator('#username svg').click();
  await page.locator('#react-select-2-option-0-0').click();
  await page.locator('#password svg').click();
  await page.locator('#react-select-3-option-0-0').click();
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.getByLabel('First Name').click();
  await page.getByLabel('First Name').fill('SampleFirst');
  await page.getByLabel('Last Name').click();
  await page.getByLabel('Last Name').fill('sampleLast');
  await page.getByLabel('Address').click();
  await page.getByLabel('Address').fill('sampleAddress');
  await page.getByLabel('State/Province').click();
  await page.getByLabel('State/Province').fill('SampleState');
  await page.getByLabel('Postal Code').click();
  await page.getByLabel('Postal Code').fill('123456');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Continue Shopping »' }).click();

  await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {status: 'passed',reason: 'Product added to cart'}})}`);

} catch (e) {
  console.log(e);
  await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {status: 'failed',reason: 'Test failed'}})}`);

}  

});
