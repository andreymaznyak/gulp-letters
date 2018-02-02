const MailDev = require('maildev');
const mailsConfig = require('./mails-config');

function MockSmtpServer(config) {
  const maildev = new MailDev({
    smtp: mailsConfig.smtpServerConfig.port, // incoming SMTP port - default is 1025
    silent: true
  });
  return maildev;
}
const mockSmtpInstance = new MockSmtpServer(mailsConfig);
mockSmtpInstance.listen(() => {
  process.send({ type: 'start' });
});
mockSmtpInstance.on('new', email => {
  process.send({ type: 'new', email });
});

module.exports = { MockSmtpServer };
