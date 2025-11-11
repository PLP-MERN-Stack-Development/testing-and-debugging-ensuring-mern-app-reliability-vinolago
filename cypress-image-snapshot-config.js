// cypress-image-snapshot-config.js - Visual regression configuration

const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);

  // Configure image snapshot settings
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-web-security');
      launchOptions.args.push('--disable-features=VizDisplayCompositor');
    }
    return launchOptions;
  });

  return config;
};