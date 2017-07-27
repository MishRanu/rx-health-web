var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-cssnano'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    stylus = require('gulp-stylus'),
    rename = require('gulp-rename'),
    minifyHTML = require('gulp-htmlmin'),
    header = require('gulp-header'),
    babel = require('gulp-babel');
var paths = {
    scripts: 'src/js/**/*.*',
    styles: 'src/stylus/**/*.*',
    images: 'src/img/**/*.*',
    templates: 'src/templates/**/*.html',
    index: 'src/index.html',
    bower_fonts: 'src/components/**/*.{ttf,woff,eof,svg}',
    audio : 'src/audio/**/*.*',
    sw : 'src/sw.js',
    manifest : 'src/manifest.json'
};



/**
 * Handle bower components from index
 */

gulp.task('usemin', function() {
    return gulp.src(paths.index)
        .pipe(usemin({
            js: [minifyJs(), 'concat'],
            css: [minifyCss({keepSpecialComments: 0}), 'concat'],
        }))
        // .pipe(minifyHTML().on('error', function(e){
        //     console.log(e);
        //  }))
        .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('build-assets', ['copy-bower_fonts']);

gulp.task('copy-bower_fonts', function() {
    return gulp.src(paths.bower_fonts)
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest('dist/lib'));
});

/**
 * Handle custom files
 */
gulp.task('build-custom', ['custom-audio', 'custom-images', 'custom-js', 'custom-stylus', 'custom-templates', 'custom-sw', 'custom-manifest']);

gulp.task('custom-audio', function() {
    return gulp.src(paths.audio)
        .pipe(gulp.dest('dist/audio'));
});

gulp.task('custom-images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('custom-js', function() {
    return gulp.src(paths.scripts)
        .pipe(babel())
        // .pipe(minifyJs().on('error', function(e){
        //     console.log(JSON.stringify(e));
        //  }))
        .pipe(concat('dashboard.min.js'))
        .pipe(header('"use strict"\;'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('custom-sw', function() {
  return gulp.src(paths.sw)
    .pipe(babel())
    // .pipe(minifyJs().on('error', function(e){
    //     console.log(e);
    //  }))
    .pipe(gulp.dest('dist'));
})

gulp.task('custom-stylus', function() {
    return gulp.src(paths.styles)
        .pipe(stylus())
        .pipe(minifyCss().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('custom-templates', function() {
    return gulp.src(paths.templates)
        .pipe(minifyHTML().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest('dist/templates'));
});

gulp.task('custom-manifest', function() {
    return gulp.src(paths.manifest)
        .pipe(gulp.dest('dist'));
});

/**
 * Watch custom files
 */
gulp.task('watch', function() {
    gulp.watch([paths.audio], ['custom-audio']);
    gulp.watch([paths.images], ['custom-images']);
    gulp.watch([paths.styles], ['custom-stylus']);
    gulp.watch([paths.scripts], ['custom-js']);
    gulp.watch([paths.templates], ['custom-templates']);
    gulp.watch([paths.index], ['usemin']);
    gulp.watch([paths.sw], ['custom-sw']);
    gulp.watch([paths.manifest], ['custom-manifest']);
});

/**
 * Live reload server
 */
gulp.task('webserver', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 8888
    });
});

gulp.task('livereload', function() {
    gulp.src(['dist/**/*.*'])
        .pipe(watch(['dist/**/*.*']))
        .pipe(connect.reload());
});

/**
 * Gulp tasks
 */
gulp.task('build', ['usemin', 'build-assets', 'build-custom']);
gulp.task('serve', ['build', 'webserver', 'livereload', 'watch']);
gulp.task('default', function(){
  console.log('           1.) Please use gulp serve to open server\n 2.) Use gulp build to build without serving');
});
