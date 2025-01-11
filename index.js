const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();
const getExcelSheet = require('./functions/ProcessVideo/getExcelSheet');
const extractFrames = require('./functions/getVideo/extractframes');
const processImages = require('./functions/ProcessVideo/processImages');
ffmpeg.setFfmpegPath(ffmpegPath);

const args = require('minimist')(process.argv.slice(2));

const directoryPath = './video-dataset';
const outputFilePath = './results.json';
const videoPath = './video-dataset/IFT-2 Full - Made with Clipchamp.mp4'

async function main() {
    try {
        // await extractFrames(videoPath);
        await processImages(directoryPath, outputFilePath);
        getExcelSheet(outputFilePath)
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();