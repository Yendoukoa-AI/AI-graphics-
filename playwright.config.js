const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests-e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  reporter: 'list',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'lambdatest-chrome',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify({
            'browserName': 'Chrome',
            'browserVersion': 'latest',
            'LT:Options': {
              'platform': 'Windows 10',
              'build': 'Playwright Build',
              'name': 'Playwright Test',
              'user': process.env.LT_USERNAME,
              'accessKey': process.env.LT_ACCESS_KEY,
              'network': true,
              'video': true,
              'console': true
            }
          }))}`
        }
      },
    },
  ],
};

module.exports = config;
