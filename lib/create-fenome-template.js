const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
/**
 * Функция генерирует php файл, из pug файла переданного в pipe
 */
function createFenomTemplate(options) {
  options = options || {};
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    if (file.isStream()) {
      cb(new Error('gulp-jade2php', 'Streaming not supported'));
      return;
    }
    options = {
      ...options,
      ...{
        source: file.path,
        filename: file.path
      }
    };
    try {
      file.contents = new Buffer(
        jade2php(file.contents.toString(), {
          ...phpDefaultOptions,
          ...options
        })
      );
      this.push(file);
    } catch (error) {
      this.emit(
        'error',
        new Error('gulp-jade2php', error, {
          fileName: file.path
        })
      );
    }
    return cb();
  });
}

module.exports = { createFenomTemplate };
