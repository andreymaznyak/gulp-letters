module.exports = function(options) {
  return `
doctype
html(lang='en')
    head
        link(rel="stylesheet", href="css/${options.letterName}.css")
        meta(charset="utf-8")
    body
        h1 Hello letter ${options.letterName}
`;
};
