// Gulp 4/5 系の構文で読み込み
const { src, dest, parallel } = require('gulp');

// 共通のパス
const distDir = 'dist';
const srcDir = 'src';
const srcImgGlob = srcDir + '//**/*.{png,jpg,jpeg,gif,PNG,JPG,JPEG,GIF}';

// 画像最適化プラグイン
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const webp = require('gulp-webp');

// OGPリサイズ用プラグイン
const sharp = require('gulp-sharp-responsive');
const rename = require('gulp-rename');

// タイムスタンプ生成
const getTimestamp = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

// 画像を圧縮するタスク
function imgMin() {
  return src(srcImgGlob)
    .pipe(imagemin([
      pngquant({
        quality: [0.65, 0.80],
        speed: 1
      }),
      mozjpeg({
        quality: 80,
        progressive: true
      }),
      require('imagemin-svgo')(),
      require('imagemin-optipng')(),
      require('imagemin-gifsicle')()
    ]))
    .pipe(dest(distDir)); // 出力先を dist に変更
}

// webp形式での変換タスク
function imgWebp() {
  return src(srcImgGlob)
    .pipe(webp({ quality: 80 }))
    .pipe(dest(distDir)); // 出力先を dist に変更
}

// --- OGPリサイズタスク ---
function ogpResize() {
  const timestamp = getTimestamp();
  const outputDir = `${distDir}/ogp_${timestamp}`;

  return src(srcImgGlob)
    .pipe(sharp({
      formats: [
        {
          width: 2400,
          height: 1260,
          fit: 'cover',
          jpegOptions: { quality: 80, progressive: true },
          pngOptions: { quality: 80 },
        }
      ]
    }))
    .pipe(dest(outputDir)); // タイムスタンプ付きフォルダに出力
}

// タスクをエクスポート
exports.img = imgMin;
exports.webp = imgWebp;
exports.ogp = ogpResize;

// `npx gulp` で実行されるデフォルトタスク
// ★安全のため、OGPリサイズは default から除外します
// 実行されるのは「圧縮」と「WebP変換」のみ
exports.default = parallel(imgMin, imgWebp);