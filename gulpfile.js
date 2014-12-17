var gulp = require('gulp');
var jade = require('gulp-jade');
var less = require('gulp-less');

var jadeFiles = './assets/jade/**/*.jade';
var lessFiles = './assets/less/app.less';
var jsFiles = './assets/js/**/*.js';

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