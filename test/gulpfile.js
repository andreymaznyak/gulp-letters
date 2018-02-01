const gulp = require('gulp');
const registerTasks = require('../lib/cli.tasks').registerTasks;

const mailsConfig = require('./mails-config');

registerTasks(mailsConfig, [
  'new',
  'serve',
  'build',
  'send',
  'clean',
  'remove'
]);

gulp.task('default', gulp.series(['build']));
