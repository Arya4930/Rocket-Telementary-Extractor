import fs from 'fs';
import path from 'path';
import { isInt } from '../utils/Functions.js';
import chalk from 'chalk';
import CropAll from '../utils/Croplmages.js';
import sharp from 'sharp';
import analyzeImageFromFile from './analyzeImageFromFile.js';
import {
    saveLatestFrame,
    IncremenetTimeBy1second
} from '../utils/Functions.js';
import {
    getWordsFromAzure,
    getWordsFromTesseract
} from '../ProcessVideo/analyzeImageFromFile.js';

export default async function processImages(
    directoryPath,
    outputFilePath,
    rocketType
) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{5}\.png$/.test(file));
    const mergedFiles = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frames_\d{5}\.png$/.test(file));

    let skipCount = 0;
    let incomingData = false;
    let firstTimeData = false;
    let time = null;
    let timeCounter = 0;

    async function checkMetadata(fileArray, expectedHeight) {
        if (fileArray.length === 0) return false;
        const meta = await sharp(
            path.join(directoryPath, fileArray[1])
        ).metadata();
        return meta.height === expectedHeight;
    }

    if (await checkMetadata(files, 190)) firstTimeData = true;
    if (await checkMetadata(mergedFiles, 950)) {
        incomingData = firstTimeData = true;
        const outputPath = path.join(directoryPath, `getTime.png`);
        await sharp(path.join(directoryPath, mergedFiles[0]))
            .extract({ left: 854, top: 55, width: 216, height: 46 })
            .toFile(outputPath);
        time = (await getWordsFromTesseract(outputPath))[0].substring(2);
        fs.unlinkSync(outputPath);
    }

    fs.writeFileSync(outputFilePath, '[\n');

    // **Processing function**
    async function processFileList(fileList, isMerged = false) {
        for (const file of fileList) {
            const filePath = path.join(directoryPath, file);

            if (skipCount > 0) {
                skipCount--;
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(
                        `Failed to delete ${filePath}: ${err.message}`
                    );
                }
                if (skipCount === 0) timeCounter = 0;
                continue;
            }

            console.log(
                chalk.blue(
                    '==========================================================='
                )
            );
            console.log(
                chalk.green.bold(`Processing: ${path.basename(filePath)}`)
            );
            const start = performance.now();

            await saveLatestFrame(filePath, directoryPath);
            const data = await analyzeImageFromFile(
                filePath,
                rocketType,
                time,
                incomingData
            );
            const end = performance.now();
            console.log(
                chalk.yellow.bold(
                    `Time taken for ${file}: ${((end - start) / 1000).toFixed(2)}s.`
                )
            );

            let values =
                typeof data === 'object' && data
                    ? Object.values(data).slice(1)
                    : [];

            if (isInt(data)) {
                skipCount = data;
                console.log(`Skipping next ${skipCount} files...`);
                fs.unlinkSync(filePath);
                continue;
            }

            if (
                !data ||
                (Array.isArray(values) &&
                    values.every((val) => val === 0) &&
                    !incomingData)
            ) {
                console.log(`No data found for ${filePath}. Skipping...`);
                fs.unlinkSync(filePath);
                timeCounter++;
                if (timeCounter > 20) {
                    console.log(`Skipping next 60 files as all values are 0`);
                    skipCount = 60;
                }
                continue;
            }

            if (isMerged) {
                const outputPath = path.join(directoryPath, `getTime.png`);
                await sharp(filePath)
                    .extract({
                        left: 854,
                        top: 55 + 760,
                        width: 216,
                        height: 46
                    })
                    .toFile(outputPath);

                const extractedText = await getWordsFromTesseract(outputPath);
                fs.unlinkSync(outputPath);
                if (extractedText.length > 0) {
                    time = extractedText[0].substring(2);
                } else {
                    time = 'NaN:NaN:NaN';
                }
                const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
                if (!timeRegex.test(time)) {
                    time = data[4].time;
                }
            } else {
                time = data.time;
            }
            time = IncremenetTimeBy1second(time);
            if (isMerged) {
                for (let i = 0; i < 5; i++) {
                    fs.appendFileSync(
                        outputFilePath,
                        JSON.stringify(data[i], null, 2) + ',\n'
                    );
                }
            }

            incomingData = true;
            timeCounter = 0;

            if (!firstTimeData) {
                await CropAll(directoryPath);
                firstTimeData = true;
                break;
            }
        }
    }

    try {
        await processFileList(files);
        await processFileList(
            fs
                .readdirSync(directoryPath)
                .filter((file) => /^frames_\d{5}\.png$/.test(file)),
            true
        );
    } catch (err) {
        console.error('Error occurred in processing files:', err);
    }

    // Clean up JSON output
    let outputData = fs
        .readFileSync(outputFilePath, 'utf8')
        .replace(/,\s*$/, '');
    fs.writeFileSync(outputFilePath, outputData + '\n]\n');
    console.log(`Results saved to ${outputFilePath}`);
}
