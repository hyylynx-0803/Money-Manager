import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const sizes = [192, 512]

for (const size of sizes) {
  await sharp(path.join(publicDir, 'icon.svg'))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `icon-${size}.png`))
  console.log(`Generated icon-${size}.png`)
}

console.log('All icons generated!')
