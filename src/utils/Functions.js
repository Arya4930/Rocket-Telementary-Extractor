import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export function IncremenetTimeBy1second(time) {
    let timeParts = time.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);
    seconds += 1;
    if (seconds >= 60) {
        seconds = 0;
        minutes += 1;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isInt(value) {
    return (
        !isNaN(value) &&
        (function (x) {
            return (x | 0) === x;
        })(parseFloat(value))
    );
}

export async function CropImagesToAnalyze(img, regions) {
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

export async function saveLatestFrame(filePath, directoryPath) {
    const latestPath = path.join(directoryPath, 'latest.png');
    fs.copyFileSync(filePath, latestPath);
}
