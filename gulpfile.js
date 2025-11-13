// Gulp 4/5 系の構文で読み込み
const { src, dest, parallel } = require('gulp');

// 共通のパス
const distDir = 'dist';
const srcDir = 'src';
const srcImgGlob = srcDir + '/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}';

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

// --- 画像を指定サイズにリサイズし、実際のサイズを名前に付与するタスク ---
const path = require('path');
const fs = require('fs').promises;
const glob = require('glob');
const sharpLib = require('sharp'); // sharp本体を読み込む

async function resize() {
  const outputDir = `${distDir}/resized`;
  const options = {
    maxWidth: 2400,
    maxHeight: 1260,
  };

  // 出力先ディレクトリを作成
  await fs.mkdir(outputDir, { recursive: true });

  // globで画像ファイルを取得
  const files = glob.sync(srcImgGlob);

  for (const file of files) {
    try {
      const originalName = path.basename(file, path.extname(file));
      const fileBuffer = await fs.readFile(file);

      const resizedBuffer = await sharpLib(fileBuffer)
        .resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      const metadata = await sharpLib(resizedBuffer).metadata();
      const { width, height } = metadata;

      const newFileName = `${originalName}_${width}x${height}${path.extname(file)}`;
      const outputPath = path.join(outputDir, newFileName);

      await fs.writeFile(outputPath, resizedBuffer);
      console.log(`Processed: ${newFileName}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

// タスクをエクスポート
exports.img = imgMin;
exports.webp = imgWebp;
exports.resize = resize; // リサイズタスク

// `npx gulp` で実行されるデフォルトタスク
exports.default = parallel(imgMin, imgWebp);