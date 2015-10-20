var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    livereload = require('gulp-livereload'),
    rimraf = require('gulp-rimraf'),
    concatCss = require('gulp-concat-css'),
    rjs = require('gulp-requirejs'),
    mainBowerFiles = require('main-bower-files');


gulp.task('stylus', function () {
    gulp.src('./dev/**/*.styl')
        .pipe(stylus({error: true}))
        .pipe(concatCss('common.css'))
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});


gulp.task('html', function(){
    gulp.src('./dev/index.html')
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});

gulp.task('lr-server', function() {
    var lrOptions = {
        port: 35729,
        host: 'localhost',
        start: true
    };
    livereload(lrOptions);
    livereload.listen();
});

gulp.task('images', function () {
    gulp.src('./dev/**/*.svg')
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});

gulp.task("bower-files", function(){
    gulp.src(mainBowerFiles()).pipe(gulp.dest("./vendor/"));
});

gulp.task('scripts--dev', function() {
    gulp.src('./dev/**/*.js')
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});

gulp.task('scripts--build', function() {
    rjs({
        baseUrl: './dev/',
        out: 'main.js',
        generateSourceMaps: true,
        preserveLicenseComments: false,
        optimize: 'uglify2',
        paths: {
            angular: 'empty:',
            domReady: 'empty:',
            angularUiRoute: 'empty:',
            angularUiGrid: 'empty:',
            text: '../vendor/text'
        },
        name: 'init'
    })
    .pipe(gulp.dest('./build/'))
    .pipe(livereload());
});

gulp.task('fake-data-copy', function () {
    gulp.src('./dev/**/*.json')
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});

gulp.task('watch', function () {
    var initiallyTasks = ['lr-server', 'html', 'stylus'];

    gulp.start(initiallyTasks);

    gulp.watch('./dev/**/*.styl', ['stylus']);
    gulp.watch('./dev/index.html', ['html']);
    gulp.watch(['./dev/**/.js', './dev/**/*.html', '!./dev/index.html'], ['scripts--build']);
});

gulp.task('build', function() {
    rimraf('./build');
    gulp.start(['fake-data-copy', 'html', 'stylus', 'scripts--build', 'images']);
});