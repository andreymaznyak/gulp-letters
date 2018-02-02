# Gulp letter

[![Greenkeeper badge](https://badges.greenkeeper.io/andreymaznyak/gulp-letters.svg)](https://greenkeeper.io/)

\* Read this in other languages: [English](README.md), [Русский](README.ru.md),

Gulp tasks for easy letter styling development

Features:

Usage in gulp file:

```javascript
var gulp = require('gulp');
// include default tasks registrator
var registerTasks = require('gulp-letters').registerTasks;
// define smtp config
var mailsConfig = {
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
registerTasks(mailsConfig, ['new', 'serve', 'build', 'send']);
// define default gulp task
gulp.task('default', gulp.series(['build']));
```
