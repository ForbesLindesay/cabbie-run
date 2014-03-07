'use strict';

var cp = require('child_process');
var getBrowser = require('cabbie');

module.exports = run;
function run(file, selenium, capabilities, options) {
  var browser = getBrowser(selenium, capabilities, {
    mode: 'async'
  });
  return Promise.from(browser.getSessionID()).then(function (sessionID) {
    options.sessionID = sessionID;
    return new Promise(function (resolve, reject) {
      var child = cp.fork(require.resolve('./runner'), {silent: true});
      var results = [];
      child.once('error', reject);
      child.once('exit', function (exitCode) {
        setTimeout(function () {
          outputResults(results);
          resolve({
            results: results,
            exitCode: exitCode
          });
        }, 1000);
      });
      child.on('message', function (data) {
        results[data.order] = message;
      });
      child.send({
        script: file,
        selenium: selenium,
        capabilities: capabilities,
        options: options
      });
    });
  }).then(function (res) {
    return Promise.from(browser.dispose({passed: !!res.exitCode}))
    .then(function () {
      return res;
    });
  });
}