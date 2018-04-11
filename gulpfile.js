/* eslint-env node */
const gulp = require('gulp');
const minify = require('gulp-minify');
const responsive = require('gulp-responsive-images');
const sass = require('gulp-sass');
const environment = require('gulp-environments');
const sourcemaps = require('gulp-sourcemaps');
const webserver = require('gulp-webserver');
const gzip = require('gulp-gzip');

const production = environment.production;
const development = environment.development;

gulp.task('sass', function() {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(development(sourcemaps.init()))
		.pipe(sass({
			outputStyle: production() ? 'compressed' : 'expanded',
			indentType: 'tab',
			indentWidth: 1
		}).on('error', sass.logError))
		.pipe(development(sourcemaps.write()))
		.pipe(production(gzip()))
		.pipe(gulp.dest('./dist/css/'));
});
gulp.task('sass:watch', ['sass'], function() {
	return gulp.watch('./src/scss/**/*.scss', ['sass']);
});

gulp.task('js:minify', function() {
	return gulp.src('./src/js/**/*.js')
		// .pipe(development(sourcemaps.init()))
		.pipe(production(minify({
			noSource: true,
			ext: {min: '.js'}
		})))
		// .pipe(development(sourcemaps.write()))
		.pipe(production(gzip()))
		.pipe(gulp.dest('./dist/js/'));
});
gulp.task('js:watch', ['js:minify'], function() {
	return gulp.watch('./src/js/**/*.js', ['js:minify']);
});

gulp.task('webserver', function() {
	return gulp.src('dist')
		.pipe(webserver({
			fallback: 'index.html'
		}));
});

gulp.task('root:copy', function() {
	return gulp.src('./src/*.*')
		.pipe(gulp.dest('./dist/'));
});
gulp.task('root:watch', ['root:copy'], function() {
	gulp.watch('./src/*.*', ['root:copy']);
});

gulp.task('icon:copy', function() {
	return gulp.src('./src/img/icons/*.png')
		.pipe(gulp.dest('./dist/img/icons'));
});
gulp.task('imagemin', ['icon:copy'], function() {
	return gulp.src('./src/img/*.jpg')
		.pipe(responsive({
			'*.jpg': [
				{
					width: 200,
					quality: 70,
					suffix: '_200'
				},
				{
					width: 400,
					quality: 70,
					suffix: '_400'
				},
				{
					width: 600,
					quality: 70,
					suffix: '_600'
				},
				{
					width: 800,
					quality: 70,
					suffix: '_800'
				},
			]
		}))
		.pipe(gulp.dest('./dist/img/'));
});


gulp.task('set-dev', development.task);
gulp.task('set-pro', production.task);

gulp.task('default', ['imagemin', 'sass:watch', 'js:watch', 'root:watch', 'webserver']);
gulp.task('build', ['set-pro', 'imagemin', 'sass', 'js:minify', 'root:copy']);