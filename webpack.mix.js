let mix = require("laravel-mix");
let tailwindcss = require("tailwindcss");
const { glb } = require("laravel-mix-glob");

const childThemePath =
  "./wp-content/themes/" +
  (process.env.CHILD_THEME_FOLDER || "vdigital-wp-child-theme");

mix
  .js(
    [childThemePath + "/resources/js/footer.js"],
    childThemePath + "/assets/js/footer.js",
  )
  .js(
    [childThemePath + "/resources/js/header.js"],
    childThemePath + "/assets/js/header.js",
  )
  .sass(
    childThemePath + "/resources/sass/admin/main.scss",
    childThemePath + "/assets/css/admin/main.css",
  )
  .sass(
    childThemePath + "/resources/sass/admin/acf-fields/wysiwyg.scss",
    childThemePath + "/assets/css/admin/acf-fields/wysiwyg.css",
  )
  .sass(
    childThemePath + "/resources/sass/main.scss",
    childThemePath + "/assets/css/main.css",
  )
  .js(
    glb.src(childThemePath + "/blocks/*/javascript/*.js"),
    glb.out({
      outMap: (src, mixFuncName) => src.replace("/javascript/", "/dist/"),
    }),
  )
  .sass(
    glb.src(childThemePath + "/blocks/*/sass/main.scss"),
    glb.out({
      outMap: (src, mixFuncName) =>
        src.replace("/sass/", "/dist/").replace(".scss", ".css"),
    }),
  )
  .options({
    postCss: [tailwindcss("./tailwind.js")],
  });
