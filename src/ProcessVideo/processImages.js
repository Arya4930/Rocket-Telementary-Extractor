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

    const results = await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(directoryPath, file);
            if (skipcount > 0) {
                skipcount--;
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(
                        `Failed to delete ${filePath}: ${err.message}`
                    );
                }
                if (skipcount === 0) {
                    timeCtr = 0;
                }
                return null;
            }

            console.log(
                chalk.green.bold(`Processing: ${path.basename(filePath)}`)
            );
            const start = performance.now();

            const data = await AnalyzeWorkerPool.runTask({
                filePath,
                rocketType,
                time
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
                return null; // Skip this file
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
                return { file, ...data };
            }

            InCommingData = true;
            timeCtr = 0;

            if (!firstTimeData) {
                await CropImages(directoryPath);
                firstTimeData = true;
            }

            return { file, ...data };
        })
    );
    fs.appendFileSync(
        outputFilePath,
        results
            .filter(Boolean)
            .map((r) => JSON.stringify(r, null, 2))
            .join(',\n') + '\n]\n'
    );

    console.log(`Results saved to ${outputFilePath}`);
}
