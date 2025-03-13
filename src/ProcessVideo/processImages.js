import fs from 'fs';
import path from 'path';
import { isInt } from '../utils/Functions.js';
import chalk from 'chalk';
import CropImages from './Croplmages.js';
import sharp from 'sharp';
// import { AnalyzeWorkerPool } from './workerpool.js';
import analyzeImageFromFile from './analyzeImageFromFile.js';
import { saveLatestFrame } from '../utils/Functions.js';

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
        console.log(
            chalk.blue(
                '==========================================================='
            )
        );
        console.log(chalk.green.bold(`Processing: ${path.basename(filePath)}`));
        const start = performance.now();
        await saveLatestFrame(filePath, directoryPath);
        const data = await analyzeImageFromFile(
            filePath,
            rocketType,
            time,
            InCommingData
        );
        // const data = await AnalyzeWorkerPool.runTask({
        //     imagePath: filePath,
        //     rocketType,
        //     Temptime: time
        // });
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
                continue;
            }
            continue;
        } else if (
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
        if (values.every((val) => val === 0 || val === NaN)) {
            // if a lot of values are comming as 0 than start counting them and if they are more than 10 than skip the next 10 files
            timeCtr++;
            fs.unlinkSync(filePath);
            if (timeCtr > 20) {
                console.log(`skipping Next 60 files as all values are 0`);
                skipcount = 60;
                InCommingData = false;
                continue;
            }
            fs.appendFileSync(
                outputFilePath,
                JSON.stringify({ file: file, ...data }, null, 2) + ',\n'
            );
            continue;
        }
        fs.appendFileSync(
            outputFilePath,
            JSON.stringify({ file: file, ...data }, null, 2) + ',\n'
        );
        InCommingData = true;
        // resetting the time counter
        timeCtr = 0;
        if (!firstTimeData) {
            await CropImages(directoryPath);
            firstTimeData = true;
        }
    }
    let outputData = fs.readFileSync(outputFilePath, 'utf8');
    outputData = outputData.replace(/,\s*$/, '');
    fs.writeFileSync(outputFilePath, outputData + '\n]\n');
    console.log(`Results saved to ${outputFilePath}`);
}
