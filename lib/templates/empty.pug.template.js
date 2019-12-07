module.exports = function(options) {
  return `
doctype
html(lang='en')
    head
        meta(charset="utf-8")
    body
        h1 Hello letter ${options.letterName}
`;
};
