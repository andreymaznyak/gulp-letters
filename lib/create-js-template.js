const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
/**
 * Функция генерирует js файл, из файлов переданых в pipe
 */
function createJsTemplate() {
  return through.obj(function(chunk, enc, cb) {
    return readFile(chunk.path, enc).then(async html => {
      const outputHtml =
        'module.exports = function(options) { return `' + html + '` }';
      await writeFile(chunk.path, outputHtml);
      cb(null, chunk);
    });
  });
}

module.exports = {createJsTemplate};
