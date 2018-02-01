module.exports = {
  smtpServerConfig: {
    host: 'localhost',
    secure: false,
    port: 1025,
    tls: {
      rejectUnauthorized: false
    }
  },
  subjects: {
    default: {
      from: '"Mail new message ✉️ " <no-replay@localhost>',
      to: 'test@user.com',
      subject: 'This is new message ✉️'
    }
  },
  params: {}
};
