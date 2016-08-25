var fs = require('fs');
var colors = require('colors/safe');
var _ = require('lodash');

var SugarReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
  var log = logger.create('reporter.sugar');
  var helloConfig = config.helloReporter || {};

  baseReporterDecorator(this);

  this.adapters = [function(msg) {
      process.stdout.write.bind(process.stdout)(msg + "\r\n");
  }];

  this.onSpecComplete = function(browser, result) {
      if (!result.skipped && !result.success) {
        var filePath = _.last(result.log[0].match(/\.\/.*\.js/g));
        var data = fs.readFileSync(filePath, 'utf8').split("\n");

        this.write(colors.green(filePath));

        var i = 0;
        var suite = result.suite.slice();
        var startPrinting = false;
        for (var line of data) {
          var j = 0;
          for (var suiteLine of suite) {
            if (suiteLine !== true && line.includes(suiteLine)) {
              this.write(colors.yellow(i+1) + ": " +line);
              suite[j] = true;
              break;
            }
            j++;
          }

          var suiteResolved = suite.every(x => x === true);

          if (startPrinting === false && suiteResolved && line.includes(result.description)) {
            startPrinting = 0;
          }
          if (startPrinting !== false) {
            startPrinting += 1;
            if (startPrinting === 1) {
              this.write(colors.yellow(i+1) + ": " + colors.yellow(line));
            } else {
              this.write(colors.yellow(i+1) + ": " +line);
            }
            if (startPrinting >= 5) {
              this.write('');
              break;
            }
          }

          i++;
        }
      }
  }
};

SugarReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:sugar': ['type', SugarReporter]
};
