const gulp = require('gulp');
const distDir = 'dist';
const srcDir = 'src';
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');

gulp.task('img', () => {
  return gulp.src(srcDir + '/*.{png,jpg,gif}')
    .pipe(imagemin([
      pngquant('65-80'),
      mozjpeg({
        quality: 85, 
        progressive: true
      }),
      imagemin.svgo(),
      imagemin.optipng(),
      imagemin.gifsicle()
    ]))
    .pipe(gulp.dest(distDir));
});