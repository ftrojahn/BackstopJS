#!/usr/bin/env node

const parseArgs = require('minimist');
const usage = require('./usage');
const version = require('../package.json').version;
const runner = require('../core/runner');
const logger = require('../core/util/logger');

main();

function main () {
  const argsOptions = parseArgs(process.argv.slice(2), {
    boolean: ['h', 'help', 'version', 'i', 'docker'],
    string: ['config'],
    default: {
      config: 'backstop.json'
    }
  });

  const vCount = process.argv.slice(2).filter(arg => arg.startsWith('-') && !arg.startsWith('--')).reduce((count, arg) => {
    return count + (arg.match(/v/g) || []).length;
  }, 0);
  process.env.BACKSTOP_VERBOSITY = vCount;

  // Globally override console methods to respect verbosity and apply BackstopJS formatting
  logger.globalize();

  // Catch errors from failing promises
  process.on('unhandledRejection', function (error) {
    console.error(error && error.stack);
  });

  if (argsOptions.h || argsOptions.help) {
    console.log(usage);
    return;
  }

  if (argsOptions.version) {
    console.log('BackstopJS v' + version);
    return;
  }

  const commandName = argsOptions._[0];

  if (!commandName) {
    console.log(usage);
  } else {
    console.log('BackstopJS v' + version);
    runner(commandName, argsOptions).catch(function () {
      process.exitCode = 1;
    });

    process.on('uncaughtException', function (err) {
      console.log('Uncaught exception:', err.message, err.stack);
      throw err;
    });
  }
}
