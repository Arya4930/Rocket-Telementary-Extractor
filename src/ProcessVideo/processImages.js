import fs from 'fs';
import path from 'path';
import analyzeImageFromFile from './analyzeImageFromFile.js';
import { isInt } from '../utils/Functions.js';
import chalk from 'chalk';
import CropImages from './Croplmages.js';
import sharp from 'sharp';
import { AnalyzeWorkerPool } from './workerpool.js';

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
    let firstTimeData = false;
    let time = null;
    let timeCtr = 0;

    const CheckFile = path.join(directoryPath, files[1]);
    const metadata = await sharp(CheckFile).metadata();
    if (metadata.width === 1920 && metadata.height === 190) {
        firstTimeData = true;
    }

    fs.writeFileSync(outputFilePath, '[\n');

    let results = [];

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

        console.log(chalk.green.bold(`Processing: ${path.basename(filePath)}`));
        const start = performance.now();
        const data = await AnalyzeWorkerPool.runTask({
            imagePath: filePath,
            rocketType,
            Temptime: time
        });
        const end = performance.now();
        console.log(
            chalk.yellow.bold(
                `Time taken to execute frame ${file}: ${((end - start) / 1000).toFixed(2)}s.`
            )
        );

        let values = [];
        if (typeof data === 'object' && data !== null) {
            values = Object.values(data).slice(1);
        }

        if (
            !data ||
            (typeof data === 'object' && Object.keys(data).length === 0) ||
            (Array.isArray(values) &&
                values.length > 0 &&
                values.every((val) => val === 0) &&
                !InCommingData)
        ) {
            console.log(`No data found for ${filePath}. Skipping...`);
            fs.unlinkSync(filePath);
            timeCtr++;
            if (timeCtr > 20) {
                console.log(`Skipping Next 60 files as all values are 0`);
                skipcount = 60;
            }
            continue;
        }

        if (
            typeof data === 'number' &&
            isInt(data) &&
            !InCommingData &&
            data.time !== '00:00:00'
        ) {
            skipcount = data - 1;
            console.log(`Skipping the next ${skipcount} files...`);
            fs.unlinkSync(filePath);
            continue;
        }

        time = data.time;
        if (values.every((val) => val === 0)) {
            timeCtr++;
            fs.unlinkSync(filePath);
            if (timeCtr > 20) {
                console.log(`Skipping Next 60 files as all values are 0`);
                skipcount = 60;
                InCommingData = false;
            }
            continue;
        }

        InCommingData = true;
        timeCtr = 0;

        results.push({ file, ...data });

        if (!firstTimeData) {
            await CropImages(directoryPath);
            firstTimeData = true;
        }
    }

    // Write results at once
    fs.appendFileSync(
        outputFilePath,
        results.map((r) => JSON.stringify(r, null, 2)).join(',\n') + '\n]\n'
    );

    console.log(`Results saved to ${outputFilePath}`);
}
