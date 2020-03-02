const gulp = require('gulp');
const distDir = 'dist';
const srcDir = 'src';
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const webp = require('gulp-webp');

// 画像を圧縮する
gulp.task('img', () => {
  return gulp.src(srcDir + '/*.{png,jpg,gif,PNG,JPG,GIF}')
    .pipe(imagemin([
      pngquant('65-80'),
      mozjpeg({
        quality: 80, 
        progressive: true
      }),
      imagemin.svgo(),
      imagemin.optipng(),
      imagemin.gifsicle()
    ]))
    .pipe(gulp.dest(distDir));
});

// webp形式での変換
gulp.task('webp', () =>
  gulp.src(srcDir + '/*.{png,jpg,gif,PNG,JPG,GIF}')
    .pipe(webp())
    .pipe(gulp.dest(distDir))
);