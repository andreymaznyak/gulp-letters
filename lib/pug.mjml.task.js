"use strict";

const { join } = require("path");
const { promisify } = require("util");
const through = require("through2");
const defaultPug = require("pug");
const ext = require("replace-ext");
const PluginError = require("plugin-error");
const log = require("fancy-log");
const mjml = require("mjml");
const readFile = promisify(require("fs").readFile);

module.exports = function gulpPug(options) {
  const opts = Object.assign({}, options);
  const pug = defaultPug;
  const isBuild = opts.isBuild;
  opts.data = Object.assign(opts.data || {}, opts.locals || {});

  return through.obj(async function compilePug(file, enc, cb) {
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
        let cssBody = await readFile(cssPath, { encoding: "utf-8" });

        const compiledFn = pug.compileClient(contents, opts);
        const bootstrapedModule = `
          module.exports = async function(data, { mjml, inlineCss } = {}) {
            ${compiledFn}
            const html = template(data);
            if (typeof mjml === 'function') {
              const htmlWithCss = html.replace('<mjml>', '<mjml><mj-head><mj-style inline="inline">' + \`${cssBody}\` + '</mj-style></mj-head>');
              return mjml(htmlWithCss).html;
            }
            if (typeof inlineCss === 'function') {
              // TODO продолжить
              const hasHead = html.indexOf('<head>') >= 0;
              const htmlWithCss = html.replace(/<html>\s*\n*\s*(<head>)?/gim, '<html><head>' + \`${'<style>' + cssBody + '</style>'}\` + hasHead ? '' : '</head>');
              return await inlineCss(htmlWithCss);
            }
            return html;
          }`;

        if (!isBuild) {
          const renderFn = requireFromString(
            bootstrapedModule,
            Date.now() + '',
          );
          compiled = await renderFn(data, mjml);
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
