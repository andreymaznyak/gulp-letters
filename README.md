# Gulp letter

[![Greenkeeper badge](https://badges.greenkeeper.io/andreymaznyak/gulp-letters.svg)](https://greenkeeper.io/)
[![Build status](https://travis-ci.org/andreymaznyak/gulp-letters.svg?branch=master)](https://travis-ci.org/andreymaznyak/gulp-letters)
[![coverage](https://codecov.io/gh/andreymaznyak/gulp-letters/branch/master/graph/badge.svg)](https://codecov.io/gh/andreymaznyak/gulp-letters)  

\* Read this in other languages: [English](README.md), [Русский](README.ru.md),

Gulp tasks for easy letter styling development

Features:

Usage in gulp file:

```javascript
var gulp = require('gulp');
// include default tasks registrator
var registerTasks = require('gulp-letters').registerTasks;
// define smtp config
var smtpOptions = {
  // nodemailer smtp settings
  smtpServerConfig: {
    host: 'localhost', // smtp server host
    secure: false,
    port: 1025 // smtp server port
  },
  subjects: {
    // define letters subjects
    default: {
      from: '"Mail new message ✉️ " <no-replay@localhost>',
      to: 'test@user.com',
      subject: 'This is new message ✉️'
    }
  },
  params: {} // define letters params
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
