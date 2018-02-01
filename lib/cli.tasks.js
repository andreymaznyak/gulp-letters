const gulp = require('gulp');

const { buildLetterTasks, cleanAll } = require('./common.tasks');
const { extractLetters, EmptyNameError } = require('./extract-letters');
const {
  createLetterFiles,
  removeLetterFiles
} = require('./generate-letters.tasks');

/**
 * Функция парсит из агрументов команды названия файлов писем, и для
 * каждого письма вызывает функцию переданную первым параметром, передавая её имя письма
 * @param {Function} fn Функция которая будет выполнена для каждого имени письма
 */
function forEachLetter(fn) {
  return gulp.parallel(extractLetters().map(letterName => fn(letterName)))();
}

/**
 * Функция добавляет таски для стандартного flow разработки писем
 * @param {Object} smtpOptions Настройки smtp сервера
 * @param {Array} taskNames Имена стандартных тасков которые нужно зарегистрировать
 */
function registerTasks(
  smtpOptions,
  taskNames = ['new', 'serve', 'build', 'send', 'clean', 'remove']
) {
  taskNames.forEach(taskName => {
    switch (taskName) {
      case 'new':
        registerGenerateLatterTask();
        break;
      case 'serve':
        registerServeTask();
        break;
      case 'build':
        registerBuildTask();
        break;
      case 'send':
        registerSendTask();
        break;
      case 'clean':
        registerCleanTask();
        break;
      case 'remove':
        registerRemoveTask();
        break;
      default:
        console.warn(
          'Unknown task name ' +
            taskName +
            '. Task name should be equal: "new", "serve", "build" or "send".'
        );
    }
  });

  function registerGenerateLatterTask() {
    /**
     * Таск для генерации файликов для нового письма из командной строки
     * Пример:
     * `gulp new -n "letter-name1, letterName2"`
     */
    gulp.task('new', done => {
      forEachLetter(letterName => {
        return gulp.parallel([
          function createLetter(done) {
            createLetterFiles(letterName).then(() => done());
          }
        ]);
      });
      done();
    });
  }

  function registerServeTask() {
    /**
     * Таск для открытия письма в браузере
     * Пример:
     * `gulp serve -n "letter-name1, letterName2"`
     */
    gulp.task('serve', done => {
      forEachLetter(letterName => {
        const letter = buildLetterTasks(letterName);
        return gulp.series([
          letter.clean,
          gulp.parallel([letter.compileSass, letter.compilePug]),
          letter.serve
        ]);
      });
      done();
    });
  }

  function registerBuildTask() {
    /**
     * Таск компиляции шаблонов письма для последующего использования
     * Пример:
     * `gulp build -n "letter-name1, letterName2"`
     */
    gulp.task('build', done => {
      forEachLetter(letterName => {
        const letter = buildLetterTasks(letterName, smtpOptions);
        return gulp.series([
          letter.clean,
          gulp.parallel([letter.compileSass, letter.compilePug]),
          letter.copyCssToDist,
          letter.putInlineStylesToHtml
        ]);
      });
      done();
    });
  }

  function registerSendTask() {
    /**
     * Такс компилирует все шаблоны и отправляет их на почту, указанную в smtpOptions
     * Пример:
     * `gulp send -n "letter-name1, letterName2"`
     */
    gulp.task('send', done => {
      forEachLetter(letterName => {
        const letter = buildLetterTasks(letterName, smtpOptions);
        return gulp.series([
          letter.clean,
          gulp.parallel([letter.compileSass, letter.compilePug]),
          letter.copyCssToDist,
          letter.putInlineStylesToHtml,
          letter.sendTestMail
        ]);
      });
      done();
    });
  }

  function registerCleanTask() {
    /**
     * Таск для очистки папки dev и dist
     */
    gulp.task('clean', done => {
      try {
        forEachLetter(letterName => {
          return buildLetterTasks(letterName).clean;
        });
      } catch (e) {
        if (e instanceof EmptyNameError) {
          cleanAll();
        } else {
          throw e;
        }
      }
      done();
    });
  }

  function registerRemoveTask() {
    /**
     * Таск для удаления файликов для существующего письма из командной строки
     * Удаляет pug и sass файлы
     * Пример:
     * `gulp remove -n "letter-name1, letterName2"`
     */
    gulp.task('remove', done => {
      forEachLetter(letterName => {
        return gulp.parallel([
          function removeLetter(done) {
            removeLetterFiles(letterName).then(() => done());
          }
        ]);
      });
      done();
    });
  }
}
module.exports = { registerTasks };
