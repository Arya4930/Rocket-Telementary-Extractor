import fs from 'fs';
import path from 'path';
import analyzeImageFromFile from './analyzeImageFromFile.js';
import { isInt } from '../utils/Functions.js';

export default async function processImages(
    directoryPath,
    outputFilePath,
    rocketType
) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{5}\.png$/.test(file));

    let skipcount = 0;
    let InCommingData = false;
    let time = null;
    let timeCtr = 0;

    fs.writeFileSync(outputFilePath, '[\n');

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (skipcount > 0) {
            skipcount--;
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete ${filePath}: ${err.message}`);
            }
            if (skipcount === 0) {
                timeCtr = 0;
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
            timeCtr++;
            if (timeCtr > 20) {
                console.log(`skipping Next 10 files as all values are 0`);
                skipcount = 10;
                continue;
            }
            continue;
        } else if (
            isInt(data) &&
            InCommingData == false &&
            data.time !== '00:00:00'
        ) {
            skipcount = data - 2;
            console.log(`Skipping the next ${skipcount} files...`);
            fs.unlinkSync(filePath);
            continue;
        }
        const values = Object.values(data).filter((val) => val !== 'Not found');
        time = data.time;
        if (values.every((val) => val === 0)) {
            // if a lot of values are comming as 0 than start counting them and if they are more than 10 than skip the next 10 files
            timeCtr++;
            if (timeCtr > 20) {
                console.log(`skipping Next 60 files as all values are 0`);
                skipcount = 60;
                continue;
            }
        }
        fs.appendFileSync(
            outputFilePath,
            JSON.stringify({ file: file, ...data }, null, 2) + ',\n'
        );
        InCommingData = true;
        // resetting the time counter
        timeCtr = 0;
    }

    fs.appendFileSync(outputFilePath, ']\n');
    console.log(`Results saved to ${outputFilePath}`);
}
