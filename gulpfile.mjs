import gulpPkg from "gulp";
const { src, dest, watch, series, parallel } = gulpPkg;
import sass from "gulp-sass";
import dartSass from "sass";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssdeclsort from "css-declaration-sorter";
import gcmq from "gulp-group-css-media-queries";
import browserSync from "browser-sync";
import rev from "gulp-rev"; // ✅ ESモジュールとしてインポート
import revReplace from "gulp-rev-replace";
import gulpMode from "gulp-mode";

const mode = gulpMode();

const sassCompiler = sass(dartSass);
let bs = browserSync.create();

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
		.pipe(sassCompiler({ outputStyle: "expanded" }))
		.pipe(postcss(postcssPlugins))
		.pipe(mode.production(gcmq()))
		.pipe(rev())
		.pipe(dest("./css", { sourcemaps: "./sourcemaps" }))
		.pipe(rev.manifest()) // ✅ マニフェストファイルを作成
		.pipe(dest("./rev")); // `rev` フォルダに保存
};

// HTML 内の参照をハッシュ付きに更新
const updateHtml = () => {
	const manifest = src("./rev/rev-manifest.json");
	return src("./index.html")
		.pipe(revReplace({ manifest })) // ✅ 参照を置換
		.pipe(dest("./"));
};

const buildServer = (done) => {
	bs.init({
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
	watch("./sass/**/*.scss", series(compileSass, updateHtml, bs.reload));
	watch("./index.html").on("change", bs.reload);
};

// module.exports = {
// 	sass: compileSass,
// 	default: parallel(buildServer, watchFiles),
// };

export default parallel(buildServer, watchFiles);
