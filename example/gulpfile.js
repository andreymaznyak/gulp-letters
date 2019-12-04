var gulp = require('gulp');
// include default tasks registrator
var registerTasks = require('../').registerTasks;
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
