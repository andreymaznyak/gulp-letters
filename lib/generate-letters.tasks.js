const gulp = require('gulp');
const fs = require('fs');
const util = require('util');
const emptyPug = require('./templates/empty.pug.template');
const writeFile = util.promisify(fs.writeFile);
const removeFile = util.promisify(fs.unlink);

/**
 * Функция создает 2 файла, pug файл шаблонов письма и sass файл со стилями
 * pug file - src/letterName.pug
 * sass file - src/sass/letterName.sass
 * @param {string} letterName Имя файла письма
 * @param {string} pugTemplate Кастомный шаблон pug файла
 */
function createLetterFiles(letterName, pugTemplate = null) {
  const template = pugTemplate || emptyPug({ letterName });
  return Promise.all([
    writeFile('src/' + letterName + '.pug', template),
    writeFile('src/sass/' + letterName + '.sass', '')
  ]);
}

/**
 * Функция удаляет 2 файла по имени письма
 * pug file - src/letterName.pug
 * sass file - src/sass/letterName.sass
 * @param {string} letterName Имя файла письма
 */
function removeLetterFiles(letterName) {
  return Promise.all([
    removeFile('src/' + letterName + '.pug'),
    removeFile('src/sass/' + letterName + '.sass')
  ]);
}

module.exports = { createLetterFiles, removeLetterFiles };
