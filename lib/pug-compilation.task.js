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
        if (opts.data.verbose === true) {
          log("compiling file", file.path);
        }
        const [_, dirPath, name] = file.path.match(/(.+)[\/\\]([\w\-]+).html$/);
        let dirrectoryUp = '../';
        let subDirectory = '/';
        if (dirPath.split('/src/').length === 2) {
          subDirectory = dirPath.split('/src/')[1];
          const subDirectoryLevel = subDirectory.split('/').length;
          dirrectoryUp += new Array(subDirectoryLevel).fill('../').join('/');

        }
        dirrectoryUp +='/';
        const cssPath = join(dirPath, dirrectoryUp, "dev", "css", subDirectory, name + ".css");
        let cssBody = await readFile(cssPath, { encoding: "utf-8" });

        const compiledFn = pug.compileClient(contents, opts);
        let bootstrapedModule = `
          module.exports = async function(data, { mjml, inlineCss, inlineCssUrl = '${opts.data.inlineCssUrl}' } = {}) {
            ${compiledFn}
            const html = template(data);`;
        if (!!opts.data.mjml) {
          bootstrapedModule += `if (typeof mjml === 'function') {
              if (html.indexOf('<mjml>') < 0) {
                throw new Error('Letter should contain <mjml> tag');
              }
              const htmlWithCss = html.replace(/<mjml>\\s*\\n*\\s*<mj-head>/gi, '<mjml><mj-head><mj-style inline="inline">' + \`${cssBody}\` + '</mj-style>');
              return mjml(htmlWithCss).html;
            } else { 
              throw new Error('Mjml is required param for this letter, please put it second argument');
            }
          }`;
        } else if (!!opts.data.inlineCss) {
          bootstrapedModule += `if (typeof inlineCss === 'function') {
              if (html.indexOf('<head>') < 0) {
                throw new Error('Letter should contain <head> tag');
              }
              const htmlWithCss = html.replace('<head>', '<head>' + \`${'<style>' + cssBody + '</style>'}\`);
              return await inlineCss(htmlWithCss, { url: inlineCssUrl });
            }  else { 
              throw new Error('Inline css is required param for this letter, please put it second argument');
            }
          }`;
        } else {
          bootstrapedModule += `return html;
          }`;
        }
        if (opts.data.verbose === true) {
          log("bootstraped module", bootstrapedModule);
        }
        
        if (!isBuild) {
          const renderFn = requireFromString(
            bootstrapedModule,
            Date.now() + '',
          );

          compiled = await renderFn(data, { mjml, inlineCss, inlineCssUrl: opts.data.inlineCssUrl });
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
