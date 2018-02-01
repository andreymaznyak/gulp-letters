const commonTasks = require('./lib/common.tasks');
const createJsTepmlate = require('./lib/create-js-template');
const extractLetters = require('./lib/extract-letters');
const sendMail = require('./lib/send-mail');
const generateLetters = require('./lib/generate-letters.tasks');
const cliTasks = require('./lib/cli.tasks');
module.exports = Object.assign(
  {},
  commonTasks,
  createJsTepmlate,
  extractLetters,
  sendMail,
  generateLetters,
  cliTasks
);
