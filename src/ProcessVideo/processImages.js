import fs from 'fs';
import path from 'path';
import analyzeImageFromFile from './analyzeImageFromFile.js';
import { isInt } from '../Functions.js';

export default async function processImages(
    directoryPath,
    outputFilePath,
    rocketType
) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{4}\.png$/.test(file));
    const results = [];

    let skipcount = 0;
    let InCommingData = false;
    let time = null;

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (skipcount > 0) {
            skipcount--;
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete ${filePath}: ${err.message}`);
            }
            continue;
        }
        console.log(`Processing ${filePath}`);
        const data = await analyzeImageFromFile(filePath, rocketType, time);
        if (
            (!data ||
                (typeof data === 'object' && Object.keys(data).length === 0)) &&
            InCommingData == false
        ) {
            console.log(`No data found for ${filePath}. Skipping...`);
            fs.unlinkSync(filePath);
            continue;
        } else if (isInt(data) && InCommingData == false) {
            skipcount = data - 2;
            console.log(`Skipping the next ${skipcount} files...`);
            fs.unlinkSync(filePath);
            continue;
        }
        time = data.time;
        results.push({ file: file, ...data });
        InCommingData = true;
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${outputFilePath}`);
}
