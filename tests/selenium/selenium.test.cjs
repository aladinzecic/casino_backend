const { Builder, By, until } = require("selenium-webdriver");

describe("E2E UI Tests", () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("http://localhost:3000");
  });

  afterAll(async () => {
    await driver.quit();
  });

  test("should open homepage", async () => {
    const title = await driver.getTitle();
    expect(title).toBeDefined();
  });
  
  test("should display login inputs", async () => {
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000
    );

    const passwordInput = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      10000
    );

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });
});
//npx jest tests/selenium/selenium.test.cjs