# Gulp letter

\* Read this in other languages: [English](README.md), [Русский](README.ru.md),

Библиотека gulp задач для удобной разработки писем

Возможности:

* Генерация файлов писем
* Тестовая отправка писем
* Открытие писем в браузере
* Вставка инлайновых стилей
* Компиляция pug шаблонов
* Компиляция sass стилей
* Генерация nodejs модуля на основе html, для динамического контента

Библиотека накладывает определенные ограничения на структуру директорий и именование файлов. А именно:

1. Все исходные файлы должны быть в папке src
1. Скомпилированные файлы кладутся в папку dev, с этой же папки просходит serve browserSync
1. Файлы для отправки писем кладутся в директорию dist, из этой директории нужно брать файлы для публикации и использования на сервере.
1. Имя файла index pug шаблона и index sass шаблона должны иметь название письма
1. index pug шаблон должен находиться в папке src
1. index sass шаблон должен находиться в папке src/sass

Пример использования:
Usage in gulp file:

```javascript
const gulp = require('gulp');
// Подключаем функцию которая зарегистрирует стандартные gulp задачи
const registerTasks = require('gulp-letters').registerTasks;
// Нужно определить настройки smtp для тестовой отправки писем
const smtpOptions = {
  // smtp настройки библиотеки nodemailer
  smtpServerConfig: {
    host: 'localhost',
    secure: false,
    port: 1025
  },
  // Объявляем настройки при тестовой отправке письма
  subjects: {
    default: {
      from: '"Mail new message ✉️ " <no-replay@localhost>',
      to: 'test@user.com',
      subject: 'This is new message ✉️'
    }
  },
  // Объявляем динамические переменные при тестовой отправки письма
  params: {}
};

// register default tasks
registerTasks({ smtpOptions }, [
  'new',
  'serve',
  'build',
  'send',
  'clean',
  'remove'
]);
// define default gulp task
gulp.task('default', gulp.series(['build']));
```
