// @ts-check
const { test, expect } = require('@playwright/test');

test('Local Testing', async ({ page },testInfo) => {

  try{

  await page.evaluate(_ => {},`browserstack_executor: ${JSON.stringify({action: "setSessionName", arguments: {name:testInfo.project.name}})}`);

  await page.waitForTimeout(5000);

  await page.goto('https://www.example.com/');

  await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {status: 'passed',reason: 'Local success'}})}`);

} catch (e) {
  console.log(e);
  await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({action: 'setSessionStatus',arguments: {status: 'failed',reason: 'Local fail'}})}`);

}

});
