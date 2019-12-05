'use strict';

const { readFileSync } = require('fs');
const { join } = require('path');
const { inspect } = require('util');
const through = require('through2');
const defaultPug = require('pug');
const ext = require('replace-ext');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const mjml = require('mjml');

module.exports = function gulpPug(options) {
  const opts = Object.assign({}, options);
  const pug = opts.pug || opts.jade || defaultPug;
  const isBuild = opts.isBuild;
  opts.data = Object.assign(opts.data || {}, opts.locals || {});

  return through.obj(function compilePug(file, enc, cb) {
    const data = Object.assign({}, opts.data, file.data || {});

    opts.filename = file.path;
    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if (file.isStream()) {
      return cb(new PluginError('gulp-pug', 'Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        let compiled;
        const contents = String(file.contents);
        if (opts.verbose === true) {
          log('compiling file', file.path);
        }
        const [_, dirPath, name] = file.path.match(/(.+)[\/\\]([\w\-]+).html$/);
        const cssPath = join(dirPath, '..', 'dev', 'css', name + '.css');
        let cssBody = readFileSync(cssPath, { encoding: 'utf-8'});
        log('compiling file', cssBody, file.path, name, dirPath, cssPath, inspect(data), inspect(opts), inspect(enc));
        
        if (opts.isBuild) {
          compiledFn = pug.compileClient(contents, opts);
          compiled = `
          const mjml = require('mjml');
          module.exports function(data) {
            const html = ${compiledFn}(data);
            const htmlWithCss = compiled.replace('<mjml>', '<mjml><mj-head><mj-style inline="inline">' + '${cssBody}' + '</mj-style></mj-head>');
            return mjml(htmlWithCss);
          }`
        } else {
          compiled = pug.compile(contents, opts)(data);
          compiled = compiled.replace('<mjml>', `<mjml><mj-head><mj-style inline="inline">${cssBody}</mj-style></mj-head>`);
          compiled = mjml(compiled).html;
        }
        
        file.contents = new Buffer(compiled);
      } catch (e) {
        return cb(new PluginError('gulp-pug', e));
      }
    }
    cb(null, file);
  });
};