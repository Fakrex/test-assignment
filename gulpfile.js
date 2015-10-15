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
    gulp.src('./dev/**/*.html')
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
        out: 'buildTestApp.js',
        generateSourceMaps: true,
        logLevel: 4,
        preserveLicenseComments: false,
        optimize: 'uglify2',
        include: 'main',
        mainConfigFile: "./rjsBuildConfig.js"
    })
    .pipe(gulp.dest('./build/'));
});

gulp.task('watch', function () {
    var initiallyTasks = ['lr-server', 'bower-files', 'scripts--dev', 'html', 'stylus', 'images'];

    gulp.start(initiallyTasks);

    gulp.watch('./dev/**/*.styl', ['stylus']);
    gulp.watch('./dev/**/*.html', ['html']);
    gulp.watch('./dev/**/*.svg', ['images']);
    gulp.watch(['./dev/**/*.js', './dev/*.js'], ['scripts--dev']);
});

gulp.task('build', function() {
    rimraf('./build');
    gulp.start(['bower-files', 'html', 'stylus', 'scripts--build', 'images']);
});