const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Фукнция генерирует php файл из файлов, переданных в pipe
 */
function createPhpTemplate() {
    return through.obj(function(chunk, enc, cb) {
      return readFile(chunk.path, enc).then(async html => {
        const outputHtml =
          'echo "' + html + '" ';
        await writeFile(chunk.path, outputHtml);
        cb(null, chunk);
      });
    });
  }

module.exports = { createPhpTemplate };
