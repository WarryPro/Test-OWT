const gulp = require('gulp')
const sass = require('gulp-sass')
const pug = require('gulp-pug')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const browserSync = require('browser-sync').create()

const postcssPlugins = [
    cssnano({
        core: true,
        zindex: false,
        autoprefixer: {
            add: true,
            browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'
        }
    })
]

// SASS TASKS
// Dev
gulp.task('sass-dev', () => {
    return gulp.src('src/scss/styles.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            includePaths: ['./node_modules']
        }))
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest('./public/assets/css/'))
})

// Prod
gulp.task('sass-build', () => {
    return gulp.src('src/scss/styles.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['./node_modules']
        }))
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest('./public/assets/css/'))
})


// PUG TASKS
gulp.task('pug-dev', () => {
    return gulp.src('src/pug/pages/**/*.pug')
        .pipe(pug({
            pretty: true,
            basedir: './src/pug'
        }))
        .pipe(gulp.dest('./public'))
})

gulp.task('pug-build', () => {
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe(pug({
            basedir: './src/pug'
        }))
        .pipe(gulp.dest('./public'))
})


gulp.task('dev', () => {

    gulp.watch('./src/scss/**/**', gulp.series('sass-dev'))
    gulp.watch('./src/pug/**/**', gulp.series('pug-dev'))
    browserSync.init({
        server: {
            baseDir: './public'
        }
    })
})


gulp.task('build', gulp.series(gulp.parallel(['sass-build', 'pug-build'])))