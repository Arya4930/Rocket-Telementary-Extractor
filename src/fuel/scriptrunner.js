import sharp from 'sharp';
import workerpool from './workerpool.js';

async function CropImages(img, regions) {
    const fileNames = [];
    try {
        for (const { name, left, top, width, height } of regions) {
            const outputPath = `${img}.${name}.png`;
            await sharp(img)
                .extract({ left, top, width, height })
                .toFile(outputPath);
            fileNames.push(outputPath);
        }
        return fileNames;
    } catch (err) {
        console.error(`Error in image processing: ${err.message}`);
    }
}

export async function GetFuel(img) {
    const regions = [
        { name: 'boosterlox', left: 276, top: 116, width: 240, height: 1 },
        { name: 'boosterlch4', left: 276, top: 152, width: 240, height: 1 },
        { name: 'shiplox', left: 1455, top: 116, width: 240, height: 1 },
        { name: 'shiplch4', left: 1455, top: 147, width: 240, height: 1 }
    ];

    const fileNames = await CropImages(img, regions);
    return Promise.all(fileNames.map((file) => workerpool.runTask(file)));
}
