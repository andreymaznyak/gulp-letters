"use strict";

const { readFileSync } = require("fs");
const { join } = require("path");
const { inspect } = require("util");
const through = require("through2");
const defaultPug = require("pug");
const ext = require("replace-ext");
const PluginError = require("plugin-error");
const log = require("fancy-log");
const mjml = require("mjml");

module.exports = function gulpPug(options) {
  const opts = Object.assign({}, options);
  const pug = defaultPug;
  const isBuild = opts.isBuild;
  opts.data = Object.assign(opts.data || {}, opts.locals || {});

  return through.obj(function compilePug(file, enc, cb) {
    const data = Object.assign({}, opts.data, file.data || {});

    opts.filename = file.path;
    file.path = ext(file.path, opts.client ? ".js" : ".html");

    if (file.isStream()) {
      return cb(new PluginError("gulp-pug", "Streaming not supported"));
    }

    if (file.isBuffer()) {
      try {
        let compiled;
        const contents = String(file.contents);
        if (opts.verbose === true) {
          log("compiling file", file.path);
        }
        const [_, dirPath, name] = file.path.match(/(.+)[\/\\]([\w\-]+).html$/);
        const cssPath = join(dirPath, "..", "dev", "css", name + ".css");
        let cssBody = readFileSync(cssPath, { encoding: "utf-8" });

        const compiledFn = pug.compileClient(contents, opts);
        const bootstrapedModule = `
          module.exports = function(data, mjml) {
            ${compiledFn}
            const html = template(data);
            if (typeof mjml !== 'function') {
              return html;
            }
            const htmlWithCss = html.replace('<mjml>', '<mjml><mj-head><mj-style inline="inline">' + \`${cssBody}\` + '</mj-style></mj-head>');
            return mjml(htmlWithCss).html;
          }`;

        if (!isBuild) {
          const renderFn = requireFromString(
            bootstrapedModule,
            Math.random()
              .toString(36)
              .substr(2)
          );
          compiled = renderFn(data, mjml);
        } else {
          compiled = bootstrapedModule;
        }

        file.contents = new Buffer(compiled);
      } catch (e) {
        return cb(new PluginError("gulp-pug", e));
      }
    }
    cb(null, file);
  });
};

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}
