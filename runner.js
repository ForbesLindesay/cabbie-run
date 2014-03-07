'use strict';

var getBrowser = require('cabbie');

process.once('message', function (message) {
  var order = 0;
  process.stdout.write = function (data) {
    process.send({
      order: order++,
      stream: 'stdout',
      data: data
    });
  };
  process.stderr.write = function (data) {
    process.send({
      order: order++,
      stream: 'stderr',
      data: data
    });
  };
  process.once('uncaughtException', function (err) {
    console.error((err.stack || err) + '');
    setTimeout(function () {
      process.exit(1);
    }, 1000);
  });
  var browser = getBrowser(message.selenium,
                           message.capabilities,
                           message.options);
  global.browser = browser;

  browser.setTimeout('implicit', '60s');
  if (message.domain) {
    browser.navigateTo(message.domain);
  }
  require(message.script);
});