const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
/**
 * Функция генерирует js файл, из файлов переданых в pipe
 */
function createFtlTemplate() {
  return through.obj(function(chunk, enc, cb) {
    return readFile(chunk.path, enc).then(async html => {
      await writeFile(chunk.path, html);
      cb(null, chunk);
    });
  });
}

module.exports = { createFtlTemplate };
