const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be within the project directory.
  // This is crucial for shared hosting environments like cPanel where the home directory cache might be restricted.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
