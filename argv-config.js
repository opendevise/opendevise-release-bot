'use strict';

const yargs = require('yargs')
  .usage('Usage:\n  opendevise-release-bot [--nopush] [patch|minor|major]')
  .option('p', {
    alias: 'nopush',
    default: false,
    describe: 'do not push to git remote',
    type: 'boolean'
  })
  .help('h')
  .alias('h', 'help');

const mode = yargs.argv._[0] || 'patch';
const VERSION_TYPES = ['patch', 'minor', 'major'];
if (!VERSION_TYPES.includes(mode)) {
  yargs.showHelp();
  process.exit(9);
}

module.exports = {
  nopush: yargs.argv.nopush,
  mode,
};
