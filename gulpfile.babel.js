import gulp from 'gulp'
import plumber from 'gulp-plumber'
import pug from 'gulp-pug'
import browserSync from 'browser-sync'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import watch from 'gulp-watch'
import browserify from 'browserify'
import babelify from 'babelify'
import source from 'vinyl-source-stream'
import sourcemaps from 'gulp-sourcemaps'
import buffer from 'vinyl-buffer'
import minify from 'gulp-minify'
import imagemin from 'gulp-imagemin'
import sitemap from 'gulp-sitemap'
import cachebust from 'gulp-cache-bust'
import tildeImporter from 'node-sass-tilde-importer'

const server = browserSync.create()

const startServer = () => (
  server.init({
    server: {
      baseDir: './public'
    }
  })
)

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

gulp.task('styles-dev', () => {
  return gulp.src('./src/scss/styles.scss')
    .pipe(sourcemaps.init({ loadMaps : true}))
    .pipe(plumber())
    .pipe(sass({
      importer: tildeImporter,
      outputStyle: 'expanded',
      includePaths: ['./node_modules']
    }))
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/assets/css/'))
    .pipe(server.stream({match: '**/*.css'}))
})

gulp.task('styles-build', () => {
  return gulp.src('./src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass({
      importer: tildeImporter,
      includePaths: ['./node_modules']
    }))
    .pipe(postcss(
      [
        cssnano({
          core: true,
          zindex: false,
          autoprefixer: {
            add: true,
            browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'
          }
        })
      ]
    ))
    .pipe(gulp.dest('./public/assets/css/'))
    .pipe(gulp.dest('./docs/assets/css/'))
})

gulp.task('pug-dev', () => (
  gulp.src('./src/pug/pages/**/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      basedir: './src/pug'
    }))
    .pipe(gulp.dest('./public'))
))

gulp.task('pug-build', () => (
  gulp.src('./src/pug/pages/**/*.pug')
    .pipe(plumber())
    .pipe(pug({
      basedir: './src/pug'
    }))
    .pipe(gulp.dest('./public'))
    .pipe(gulp.dest('./docs'))
))

gulp.task('scripts-dev', () => (
  browserify('./src/js/index.js')
    .transform(babelify, {
      global: true // permite importar desde afuera (como node_modules)
    })
    .bundle()
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(minify({
      ext: {
        src: '-min.js',
        min: '.js'
      }
    }))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/assets/js'))
))

gulp.task('scripts-build', () => (
  browserify('./src/js/index.js')
    .transform(babelify, {
      global: true // permite importar desde afuera (como node_modules)
    })
    .bundle()
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(minify({
      ext: {
        src: '.js',
        min: '-min.js'
      }
    }))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/assets/js'))
    .pipe(gulp.dest('./docs/assets/js')) // Github static page
))

gulp.task('images-build', () => {
  return gulp.src('./src/img/**/**')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('./public/assets/img'))
    .pipe(gulp.dest('./docs/assets/img')) // Github static page
})

gulp.task('images-dev', () => {
  return gulp.src('./src/img/**/**')
    .pipe(gulp.dest('./public/assets/img'))
})

gulp.task('sitemap', () => {
  return gulp.src('./public/**/*.html', {
    read: false
  })
    .pipe(sitemap({
      siteUrl: 'https://example.com' // Remplacer pour notre domain 
    }))
    .pipe(gulp.dest('./public'))
})

gulp.task('dev', gulp.parallel(startServer, gulp.series(['styles-dev', 'pug-dev', 'scripts-dev', 'images-dev'])), () => {

  watch('./src/scss/**/**', () => gulp.series('styles-dev', server.reload))
  watch('./src/js/**/**', () => gulp.series('scripts-dev', server.reload))
  watch('./src/pug/**/**', () => gulp.series('pug-dev', server.reload))
  watch('./src/img/**/**', () => gulp.series('images-dev'))

  return
})

gulp.task('cache', () => {
  return gulp.src('./public/**/*.html')
    .pipe(cachebust({
      type: 'timestamp'
    }))
    .pipe(gulp.dest('./public'))
})


gulp.task('build', gulp.series(gulp.parallel(['styles-build', 'pug-build', 'scripts-build', 'images-build', 'cache', 'sitemap'])))
