const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const del = require('del');
const pugMjml = require('./pug.mjml.task.js');
const extReplace = require('gulp-ext-replace');
const createJsTemplate = require('./create-js-template').createJsTemplate;
const sendMail = require('./send-mail').sendMail;

const usedPorts = []; // Использованные порты в browserSync
/**
 * Функция формирует список задач для писма
 * @param {string} letterName Имя файла письма без расширения, для которого нужно создать таски
 * @param {Object} extOptions
 * @returns Возвращает объект с задачами, где ключ имя задачи - значение функция задача
 */
function buildLetterTasks(letterName, extOptions = null) {
  // Для начала по имени писма вычислим расположения всех файлов и положим в объект options
  const options = {
    sass: {
      src: 'src/sass/' + letterName + '.sass',
      dist: 'dev/css/' // sass кладем в dev/css
    },
    pug: {
      src: 'src/' + letterName + '.pug',
      dist: 'dev/' // pug кладем в dev
    },
    html: {
      src: 'dev/' + letterName + '.html',
      dist: 'dist/' // html скомпанованный кладем в dist
    },
    ...extOptions
  };
  return {
    clean,
    compileSass,
    compilePug,
    copyCssToDist,
    putInlineStylesToHtml,
    serve,
    sendTestMail,
    setSmtpOptions: smtp => (options.smtpOptions = smtp)
  };

  /**
   * Функция очищает все файлы связанные с письмом в папке dist и dev
   * @param {Function} done
   */
  function clean(done) {
    // Добавляем таск очистки
    done();
    return del.sync([
      options.sass.dist + letterName + '.css',
      options.pug.dist + letterName + '.html',
      options.html.dist + letterName + '.js'
    ]);
  }
  /**
   * Функция компилирует sass и кладет их в dev/css
   */
  function compileSass() {
    // Добавляем таск Sass
    return gulp
      .src(options.sass.src) // Берем источник 'src/sass/ИмяФайлаДляПисьма.sass'
      .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
      .pipe(gulp.dest(options.sass.dist)) // Выгружаем результата в папку 'dev/css'
      .pipe(
        browserSync.reload({
          stream: true
        })
      ); // Обновляем CSS на странице при изменении
  }
  /**
   * Функция компилирует pug шаблоны в html и кладет их в dev
   */
  function compilePug() {
    const params = options.smtpOptions.params;
    const data = { ...params['default'], ...params[letterName] };
    return gulp
      .src(options.pug.src)
      .pipe(pugMjml({ data, client: false, verbose: true }))
      .pipe(gulp.dest(options.pug.dist));
  }
  /**
   * Функция копирует скопилированные sass файлы из папки dev в dist
   */
  function copyCssToDist() {
    return gulp
      .src([options.sass.dist + letterName + '.css'])
      .pipe(gulp.dest(options.html.dist + 'css'));
  }
  /**
   * Функция преобразовывает css стили на которые ссылается html документ в инлайновые стили
   * и помещает html шаблон в js функцию, и кладет js файл в dist
   */
  function putInlineStylesToHtml() {
    return gulp
      .src(options.html.src) // Переносим HTML в продакшен
      .pipe(extReplace('.js'))
      .pipe(gulp.dest(options.html.dist))
      .pipe(createJsTemplate());
  }

  /**
   * Функция отправляет письмо на почту
   */
  function sendTestMail() {
    return gulp
      .src(options.html.dist + letterName + '.js')
      .pipe(sendMail(letterName, options.smtpOptions));
  }

  /**
   * Функция запускает сервер browserSync в папке dev
   */
  function serve() {
    // Создаем таск browser-sync
    const bs = browserSync.create();
    bs.init({
      // Выполняем browser Sync
      port: getUnusedPort(3000), // Порт приложения
      ui: false,
      server: {
        // Определяем параметры сервера
        baseDir: options.pug.dist, // Директория для сервера - dev
        index: letterName + '.html'
      },
      ...options.browserSync
    });
    gulp.watch(['src/**/*.pug'], gulp.series(compileSass, compilePug, reload));
    gulp.watch(['src/**/*.sass'], gulp.series(compileSass, compilePug, reload));

    /**
     * Функция перезапускает браузер
     * @param {Function} done
     */
    function reload(done) {
      bs.reload();
      done();
    }
  }
}

function getUnusedPort(minPort = 4000, maxPorts = 100) {
  const port = minPort + Math.floor(Math.random() * maxPorts);
  isUnusedPort = usedPorts.indexOf(port) < 0;
  if (isUnusedPort) {
    usedPorts.push(port);
    return port;
  } else {
    return getUnusedPort();
  }
}

/**
 * Функция очищает все файлы в папках dist и dev
 * @param {Function} done
 */
function cleanAll() {
  // Добавляем таск очистки
  del.sync(['dist', 'dev']);
}

module.exports = { buildLetterTasks, cleanAll };
