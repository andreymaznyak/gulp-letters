class EmptyNameError extends Error {
  constructor() {
    super();
    this.message =
      'Please put -n param, example: `gulp build  -n "letter-name"` ';
  }
}

/**
 * Функция получает список названий указанных после параметра -n в запущенной команде через запятую
 * Пример: `gulp taskName -n "letterName1, letterName2, ..., letterNameN"`
 * @returns {Array} Возвращает массив строк
 */
function extractLetters() {
  const namesFlagIndex = process.argv.indexOf('-n');
  if (namesFlagIndex < 0) {
    throw new EmptyNameError();
  }
  const letterNames = process.argv[namesFlagIndex + 1]
    .split(',')
    .map(letterName => letterName.trim());
  console.log(letterNames);

  if (letterNames.length === 0) {
    throw new Error(
      'please put letters names! For example `gulp build  -n "letter-name"`'
    );
  }
  return letterNames;
}

module.exports = { extractLetters, EmptyNameError };
