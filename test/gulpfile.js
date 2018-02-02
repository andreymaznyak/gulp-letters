const gulp = require('gulp');
const registerTasks = require('../lib/cli.tasks').registerTasks;

const smtpOptions = require('./mails-config');

registerTasks(
  {
    smtpOptions,
    browserSync: {
      open: false
    }
  },
  ['new', 'serve', 'build', 'send', 'clean', 'remove']
);

gulp.task('default', gulp.series(['build']));
