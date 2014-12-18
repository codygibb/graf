var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');
var clean = require('gulp-clean');

var jadeFiles = './assets/jade/**/*.jade';
var jadeDest = './static/views/';

var lessFiles = './assets/less/app.less';
var lessDest = './static/css/';

var jsFiles = './assets/js/**/*.js';
var jsDest = './static/js/';

gulp.task('jade', function() {
	return gulp.src(jadeFiles)
		.pipe(jade())
		.pipe(gulp.dest('./static/views/'));
});

gulp.task('less', function() {
	return gulp.src(lessFiles)
		.pipe(less())
		.pipe(gulp.dest('./static/css/'));
});

gulp.task('js', function() {
	return gulp.src(jsFiles)
		.pipe(gulp.dest('./static/js/'));
});

gulp.task('default', function() {
	gulp.start('jade');
	gulp.start('less');
	gulp.start('js');
});

gulp.task('watch', function() {
	gulp.start('default');
	gulp.watch(jadeFiles, ['jade']);
	gulp.watch(lessFiles, ['less']);
	gulp.watch(jsFiles, ['js']);
});

gulp.task('clean', function() {
	gulp.src(jadeDest).pipe(clean());
	gulp.src(lessDest).pipe(clean());
	gulp.src(jsDest).pipe(clean());
});