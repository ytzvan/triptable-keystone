var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintReporter = require('jshint-stylish');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var minifyCSS = require('gulp-minify-css');
var less = require('gulp-less');
var path = require('path');
// new
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var paths = {
	'src':['./models/**/*.js','./routes/**/*.js', 'keystone.js', 'package.json']

};

// gulp lint
gulp.task('lint', function(){
	gulp.src(paths.src)
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));
});

// gulp watcher for lint
gulp.task('watch:lint', function () {
	gulp.src(paths.src)
		.pipe(watch())
		.pipe(jshint())
		.pipe(jshint.reporter(jshintReporter));
});
gulp.task('less', function () {
  return gulp.src('./public/css/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css/dist'));
});
// Less task
gulp.task('css', function () {
  return gulp.src('./public/css/*.css')
    .pipe(minifyCSS())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('./public/css/dist/'));
});

gulp.task('start', function () {
  nodemon({
    script: 'keystone.js'
//  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('runKeystone', shell.task('node keystone.js'));
gulp.task('watch', [

  'watch:lint'
]);

gulp.task('default', ['start', 'css', 'runKeystone']);
