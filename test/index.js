const tap = require('tap');
const { spawn } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const exists = promisify(fs.exists);
// const MockSmtpServer = require('./mock-smtp').MockSmtpServer;
// const mailsConfig = require('./mails-config');
// const smtpServer = new MockSmtpServer(mailsConfig);
// setTimeout(() => smtpServer.close(), 5000);

const lettersNamesArr = ['test1', 'test2'];
const lettersNames = lettersNamesArr.reduce(
  (res, letterName) => (res += ',' + letterName)
);

tap.test(
  'after call `new` task pug file and sass file should be exists',
  async t => {
    await startGulpTask('new', lettersNames);
    const results = await Promise.all(
      lettersNamesArr.map(letterName => {
        return Promise.all([
          exists(join(__dirname, 'src', letterName + '.pug')),
          exists(join(__dirname, 'src', 'sass', letterName + '.sass'))
        ]);
      })
    );

    const AllfileExists = results.indexOf(false) < 0;
    t.equals(AllfileExists, true); // все файлы должны быть созданы
  }
);

tap.test(
  `after call 'remove' task pug file and sass file should be removed`,
  async t => {
    await startGulpTask('remove', lettersNames);
    const results = await Promise.all(
      lettersNamesArr.map(letterName => {
        return Promise.all([
          exists(join(__dirname, 'src', letterName + '.pug')),
          exists(join(__dirname, 'src', 'sass', letterName + '.sass'))
        ]);
      })
    );

    const foundExistFile = results.indexOf(true) >= 0;
    t.equals(foundExistFile, false); // Все файлы должны быть удалены
  }
);
function startGulpTask(taskName, lettersNames) {
  return new Promise((res, rej) => {
    const gulpProcces = spawn('sh', [
      '-c',
      `yarn gulp --cwd test ${taskName} -n "${lettersNames}"`
    ]);
    // gulpProcces.stdout.pipe(process.stdout);
    // gulpProcces.stdio.pipe(process.stdio);
    // gulpProcces.stderr.pipe(process.stderr);
    gulpProcces.on('close', function(exitCode) {
      if (exitCode === 0) {
        res();
      } else {
        rej('process closes with exit code: ' + exitCode);
      }
    });
  });
}
