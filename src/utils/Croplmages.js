import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';

const __dirname = import.meta.dirname;
const BLACK_BG_PATH = path.join(__dirname, '../../black_background.jpg');

async function CropImages(directoryPath) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{5}\.png$/.test(file));

    let processed = 0;
    const total = files.length;

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const tempFilePath = path.join(directoryPath, `temp_${file}`);

        try {
            await sharp(filePath)
                .extract({ left: 0, top: 890, width: 1920, height: 190 })
                .toFile(tempFilePath);

            if (fs.existsSync(tempFilePath)) {
                fs.renameSync(tempFilePath, filePath);
            } else {
                console.error(`Temp file not found: ${tempFilePath}`);
            }
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }

        processed++;
        updateProgressBar(processed, total, 'Cropping Images');
    }
    console.log('\n✅ Cropping complete!');
}

async function mergeImages(directoryPath) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{5}\.png$/.test(file))
        .sort();

    const blackBackground = await loadImage(BLACK_BG_PATH);
    const total = Math.ceil(files.length / 5);
    let processed = 0;

    for (let i = 0; i < files.length; i += 5) {
        const imageBatch = files.slice(i, i + 5);

        const images = await Promise.all(
            Array.from({ length: 5 }, async (_, index) => {
                return imageBatch[index]
                    ? loadImage(path.join(directoryPath, imageBatch[index]))
                    : blackBackground;
            })
        );

        const imgWidth = images[0].width;
        const imgHeight = images[0].height;
        const canvas = createCanvas(imgWidth, imgHeight * 5);
        const ctx = canvas.getContext('2d');

        images.forEach((img, index) => {
            ctx.drawImage(img, 0, index * imgHeight);
        });

        const outputFileName = `frames_${String(i / 5).padStart(5, '0')}.png`;
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(directoryPath, outputFileName), buffer);

        imageBatch.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        processed++;
        updateProgressBar(processed, total, 'Merging Images');
    }
    console.log('\n✅ Merging complete!');
}

export function updateProgressBar(current, total, label) {
    const barWidth = 50;
    const progress = Math.floor((current / total) * 100);
    const filledWidth = Math.floor((progress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = '█'.repeat(filledWidth) + '▒'.repeat(emptyWidth);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${label}: [${progressBar}] ${progress}%`);
}

export default async function CropAll(directoryPath) {
    console.log('✂️ Cropping images, please wait...');
    await CropImages(directoryPath);
    console.log('\n🖼️ Merging images, please wait...');
    await mergeImages(directoryPath);
    console.log('\n✅ All processing done!');
}
