const tap = require('tap');
const rp = require('request-promise');
const { spawn, fork } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);

const smtpOptions = require('./mails-config');

const letters = ['test1', 'test2'];
const lettersNames = ` -n "${letters.reduce(
  (res, letterName) => (res += ',' + letterName)
)}"`;

tap.test('after call `new` task without name', async t => {
  await t.rejects(startGulpTask('new', '').close(), `should throw error`);
});

tap.test('after call `new` task with empty names', async t => {
  await t.rejects(startGulpTask('new', '-n ').close(), `should throw error`);
});

tap.test('after call `new` task', async t => {
  await startGulpTask('new', lettersNames).close();
  await all(
    letters.map(async letterName => {
      const templateFilePath = join(__dirname, 'src', letterName + '.pug');
      const templateExist = await exists(templateFilePath);
      t.ok(templateExist, `${letterName} template should be created`);
      const stylePath = join(__dirname, 'src', 'sass', letterName + '.sass');
      const styleExist = await exists(stylePath);
      t.ok(styleExist, `${letterName} style should be created`);
    })
  );
});

tap.test('after call `serve` task', async t => {
  const gulpTask = startGulpTask('serve', lettersNames);

  const responses = await new Promise((res, rej) => {
    const hosts = [];
    gulpTask.onStdoutMessage(/http:\/\/localhost:\d\d\d\d/, host => {
      hosts.push(host);
      if (hosts.length === letters.length) {
        // check hosts responses
        res(hosts);
      }
    });
  }).then(hosts => {
    return all(hosts.map(async host => rp.get(host)));
  });
  t.ok(responses, `web server should be start and return compiled files`);
  const compiledFiles = await all(
    letters.map(letterName => {
      return readFile(join(__dirname, 'dev', letterName + '.html'), 'utf-8');
    })
  );
  t.ok(compiledFiles, `pug templates should be compiled`);

  gulpTask.process.kill(); // kill serve process after fetch responses
  compiledFiles.forEach(content => {
    const found = responses.find(response => response === content);
    t.same(found, content, 'compiled file and returned should be same');
  });
});

tap.test(`after call 'build' task`, async t => {
  await startGulpTask('build', lettersNames).close();
  await all(
    letters.map(async letterName => {
      const templatePath = join(__dirname, 'dev', letterName + '.html');
      const templateExist = await exists(templatePath);
      t.ok(templateExist, `${letterName} template should be compiled`);
      const stylePath = join(__dirname, 'dev', 'css', letterName + '.css');
      const styleExist = await exists(stylePath);
      t.ok(styleExist, `${letterName} style should be compiled`);
      const modulePath = join(__dirname, 'dist', letterName + '.js');
      const moduleExist = await exists(modulePath);
      t.ok(moduleExist, `${letterName} module should be compiled`);
    })
  );
});

tap.test(`after call 'send' task`, async t => {
  const smtp = getMockSmtp();
  await smtp.start();
  await startGulpTask('send', lettersNames).close();
  await all(
    letters.map(async letterName => {
      const templatePath = join(__dirname, 'dev', letterName + '.html');
      const templateExist = await exists(templatePath);
      t.ok(templateExist, `${letterName} template should be compiled`);
      const stylePath = join(__dirname, 'dev', 'css', letterName + '.css');
      const styleExist = await exists(stylePath);
      t.ok(styleExist, `${letterName} style should be compiled`);
      const modulePath = join(__dirname, 'dist', letterName + '.js');
      const moduleExist = await exists(modulePath);
      t.ok(moduleExist, `${letterName} module should be compiled`);
    })
  );
  const length = smtp.getMails().length;
  t.equals(length, letters.length, ` mails should be recieved`);
  smtp.process.kill();
});

tap.test(`after call 'clean' task`, async t => {
  await startGulpTask('clean', lettersNames).close();
  await all(
    letters.map(async letterName => {
      const templatePath = join(__dirname, 'dev', letterName + '.html');
      const templateExist = await exists(templatePath);
      t.notOk(templateExist, `${letterName} template should be removed`);
      const stylePath = join(__dirname, 'dev', 'css', letterName + '.css');
      const styleExist = await exists(stylePath);
      t.notOk(styleExist, `${letterName} style should be removed`);
      const modulePath = join(__dirname, 'dist', letterName + '.js');
      const moduleExist = await exists(modulePath);
      t.notOk(moduleExist, `${letterName} module should be removed`);
    })
  );
});

tap.test(`after call 'build' task without -n param`, async t => {
  await startGulpTask('build', '').close();
  await all([
    ...letters.map(async letterName => {
      const templatePath = join(__dirname, 'dev', letterName + '.html');
      const templateExist = await exists(templatePath, 'utf-8');
      t.ok(templateExist, `${letterName} template should be compiled`);
      const stylePath = join(__dirname, 'dev', 'css', letterName + '.css');
      const styleExist = await exists(stylePath);
      t.ok(styleExist, `${letterName} style should be compiled`);
      const modulePath = join(__dirname, 'dist', letterName + '.js');
      const moduleExist = await exists(modulePath);
      t.ok(moduleExist, `${letterName} module should be compiled`);
    }),
    async () => {
      const templatePath = join(__dirname, 'dev', 'example-letter.html');
      const variable = smtpOptions.params['default'].testKey;
      const template = await readFile(templatePath, 'utf-8');
      t.ok(
        template.indexOf(variable) >= 0,
        `template should be contains pug params`
      );
    }
  ]);
});

tap.test(`after call 'clean' task without -n param`, async t => {
  await startGulpTask('clean', '').close();
  await all(
    letters.map(async letterName => {
      const templatePath = join(__dirname, 'dev', letterName + '.html');
      const templateExist = await exists(templatePath);
      t.notOk(templateExist, `${letterName} template should be removed`);
      const stylePath = join(__dirname, 'dev', 'css', letterName + '.css');
      const styleExist = await exists(stylePath);
      t.notOk(styleExist, `${letterName} style should be removed`);
      const modulePath = join(__dirname, 'dist', letterName + '.js');
      const moduleExist = await exists(modulePath);
      t.notOk(moduleExist, `${letterName} module should be removed`);
    })
  );
});

tap.test(`after call 'remove' task`, async t => {
  await startGulpTask('remove', lettersNames).close();

  await all(
    letters.map(async letterName => {
      const templateFilePath = join(__dirname, 'src', letterName + '.pug');
      const templateExist = await exists(templateFilePath);
      t.notOk(templateExist, `${letterName} template should be removed`);
      const stylePath = join(__dirname, 'src', 'sass', letterName + '.sass');
      const styleExist = await exists(stylePath);
      t.notOk(styleExist, `${letterName} style should be removed`);
    })
  );
});

/**
 * Return promise all
 * @param {Array} arr of promises
 */
function all(arr) {
  return Promise.all(arr);
}

/**
 * Т.к server.close не работает приходится запускать его в отдельном процессе
 * что бы потом его можно было убить
 */
function getMockSmtp() {
  const process = fork(`${__dirname}/mock-smtp.js`);
  const mails = [];
  process.on('message', message => {
    if (message && message.type === 'new') {
      mails.push(message.email);
    }
  });
  return {
    process,
    start(timeout = 5000) {
      return new Promise((res, rej) => {
        const timerId = setTimeout(() => {
          rej(new Error('handle mails timeout ' + timeout + 'ms'));
        }, timeout);
        process.on('message', message => {
          if (message && message.type === 'start') {
            clearTimeout(timerId);
            res();
          }
        });
      });
    },
    getMails() {
      return mails;
    }
  };
}

function startGulpTask(taskName, lettersNames, timeout = 20000) {
  const process = spawn('sh', [
    '-c',
    `yarn gulp --cwd test ${taskName} ${lettersNames}`
  ]);
  let errors = '';
  process.stderr.on('data', data => (errors += data));
  return {
    process,
    close() {
      return new Promise((res, rej) => {
        process.on('close', function(exitCode) {
          if (exitCode === 0 || exitCode === null) {
            // console.log(`CLOSE proccess ${taskName}`);
            res();
          } else {
            rej(new Error('process closes with exit code: ' + exitCode));
          }
        });
      });
    },
    onStdoutMessage(regexp, fn) {
      process.stdout.on('data', data => {
        const consoleOutput = data.toString();
        const foundMessage = consoleOutput.match(regexp);
        if (!!foundMessage) {
          fn(foundMessage[0]);
        }
      });
    },
    wait(ms) {
      return new Promise((res, rej) => setTimeout(res, ms));
    }
  };
  // return new Promise((res, rej) => {

  // });
}
