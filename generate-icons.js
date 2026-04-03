const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = '/home/z/my-project/upload/file_1775259397973.jpeg';
const iconsDir = path.join(__dirname, 'client', 'public', 'icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  // Generate regular icons
  for (const size of SIZES) {
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 152, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✅ icon-${size}x${size}.png`);
  }

  // Generate maskable icons (centered with safe padding)
  for (const size of [192, 512]) {
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 152, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}-maskable.png`));
    console.log(`✅ icon-${size}x${size}-maskable.png`);
  }

  // Favicon (48x48)
  await sharp(sourceImage)
    .resize(48, 48, { fit: 'contain', background: { r: 255, g: 152, b: 0, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'favicon.png'));

  // Logo files
  await sharp(sourceImage)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'logo192.png'));
  await sharp(sourceImage)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'logo512.png'));

  // App logo for UI (200x200)
  await sharp(sourceImage)
    .resize(200, 200)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'app-logo.png'));

  // Header logo (48x48)
  await sharp(sourceImage)
    .resize(48, 48)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'header-logo.png'));

  console.log('✅ All icons generated from uploaded image!');
}

generate().catch(console.error);
