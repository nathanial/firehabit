var webdriver = require('selenium-webdriver'),
    username = "nathanial",
    accessKey = "fad301cf-11bb-432a-a771-2ad553369aa1",
    driver;
 
driver = new webdriver.Builder().
  withCapabilities({
    'browserName': 'chrome',
    'platform': 'Windows 7',
    'version': '65',
    'username': username,
    'accessKey': accessKey
  }).
  usingServer("http://" + username + ":" + accessKey +
              "@ondemand.saucelabs.com:80/wd/hub").
  build();
 
driver.get("https://saucelabs.com/test/guinea-pig");
 
driver.getTitle().then(function (title) {
    console.log("title is: " + title);
});
 
driver.quit();