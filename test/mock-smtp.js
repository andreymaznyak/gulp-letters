const { spawn } = require('child_process');

const childProcessCode = `
    const MailDev = require('maildev');
    const mailsConfig = require('./test/mails-config');
    const maildev = new MailDev({
        smtp: mailsConfig.smtpServerConfig.port // incoming SMTP port - default is 1025
    });
    maildev.listen();
`;

function MockSmtpServer(config) {
  const subprocess = spawn('sh', ['-c', `node -e "${childProcessCode}"`], {
    stdio: ['inherit', 'inherit', 'inherit']
  });
  return {
    close: () => {
      subprocess.kill();
    }
  };
}
module.exports = { MockSmtpServer };
