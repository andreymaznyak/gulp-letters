const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const nodemailer = require('nodemailer');
//require('../mails-config.json');
const util = require('util');

/**
 * Функция отправляет письма на почту описанную в mails-config.json
 * @param {string} letterName Имя файла письма
 */
function sendMail(letterName = 'default', mailsConfig) {
  if (!mailsConfig) {
    throw new Error('Mails config should be defined');
  }
  return through.obj(function(chunk, enc, cb) {
    const extension = chunk.path.match(/\.\w+$/);
    const html = '';
    if (!mailsConfig.params) {
      throw new Error(
        'Params on smtp config is not defined, please add field `params` to config'
      );
    }
    const templateOptions =
      mailsConfig.params[letterName] || mailsConfig.params['default'];
    if (extension[0] && extension[0] === '.js') {
      templateFn = require(chunk.path);
      html = templateFn(templateOptions);
    } else {
      html = fs.readFileSync(chunk.path, enc);
    }
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        throw new Error(err);
      }
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport(
        mailsConfig.smtpServerConfig
      );

      // setup email data with unicode symbols
      const mailOptions =
        mailsConfig.subjects[letterName] || mailsConfig.subjects['default'];

      mailOptions.html = html;
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error(error);
        }
        console.debug('Message sent: %s', info.messageId);
      });
    });

    cb(null, chunk);
  });
}

module.exports = { sendMail };
