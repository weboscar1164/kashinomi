const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssdeclsort = require("css-declaration-sorter");
const gcmq = require("gulp-group-css-media-queries");
const mode = require("gulp-mode")();
const browserSync = require("browser-sync");

const compileSass = () => {
	const postcssPlugins = [
		autoprefixer({
			grid: "autoplace",
			cascade: false,
		}),
		cssdeclsort({ order: "alphabetical" }),
	];
	return src("./sass/**/*.scss", { sourcemaps: true })
		.pipe(
			plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
		)
		.pipe(sass({ outputStyle: "expanded" }))
		.pipe(postcss(postcssPlugins))
		.pipe(mode.production(gcmq()))
		.pipe(dest("./css", { sourcemaps: "./sourcemaps" }))
		.pipe(browserSync.stream());
};

const buildServer = (done) => {
	browserSync.init({
		port: 8080,
		// 静的サイト
		server: { baseDir: "./" },
		// 動的サイト
		// files: ["./**/*.php"],
		// proxy: "http://localsite.local/",
		open: true,
		watchOptions: {
			debounceDelay: 1000,
		},
	});
	done();
};

const watchFiles = () => {
	watch("./sass/**/*.scss", series(compileSass));
	watch("./index.html").on("change", browserSync.reload);
};

module.exports = {
	sass: compileSass,
	default: parallel(buildServer, watchFiles),
};
