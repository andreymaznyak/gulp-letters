"use strict";

const { join } = require("path");
const { promisify } = require("util");
const through = require("through2");
const defaultPug = require("pug");
const ext = require("replace-ext");
const PluginError = require("plugin-error");
const log = require("fancy-log");
const mjml = require("mjml");
const inlineCss = require("inline-css")
const readFile = promisify(require("fs").readFile);

module.exports = function pugCompilation(options) {
  const opts = Object.assign({}, options);
  const pug = defaultPug;
  const isBuild = opts.isBuild;
  opts.data = Object.assign(opts.data || {}, opts.locals || {});
  if (opts.data.inlineCss && opts.data.mjml) {
    throw new Error('Only one transform supported inlineCss or mjml, pls choose one');
  }
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
        let bootstrapedModule = `
          module.exports = async function(data, { mjml, inlineCss } = {}) {
            ${compiledFn}
            const html = template(data);`;
        if (!!opts.data.mjml) {
          bootstrapedModule += `if (typeof mjml === 'function') {
              const htmlWithCss = html.replace('<mjml>', '<mjml><mj-head><mj-style inline="inline">' + \`${cssBody}\` + '</mj-style></mj-head>');
              return mjml(htmlWithCss).html;
            } else { 
              throw new Error('Mjml is required param for this letter, please put it second argument');
            }
          }`;
        } else if (pts.data.inlineCss) {
          bootstrapedModule += `if (typeof inlineCss === 'function') {
              const hasHead = html.indexOf('<head>') >= 0;
              const htmlWithCss = html.replace(/<html>\\s*\\n*\\s*(<head>)?/gim, '<html><head>' + \`${'<style>' + cssBody + '</style>'}\` + hasHead ? '' : '</head>');
              return await inlineCss(htmlWithCss);
            }  else { 
              throw new Error('Inline css is required param for this letter, please put it second argument');
            }
          }`;
        } else {
          bootstrapedModule += `return html;
          }`;
        }
        log(bootstrapedModule);
        if (!isBuild) {
          const renderFn = requireFromString(
            bootstrapedModule,
            Date.now() + '',
          );
          log(typeof mjml);
          compiled = await renderFn(data, { mjml, inlineCss });
        } else {
          compiled = bootstrapedModule;
        }

        file.contents = Buffer.from(compiled);
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
