import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import 'dotenv/config';
import getExcelSheet from './getExcelSheet.js';
import extractFrames from './getVideo/extractframes.js';
import processImages from './ProcessVideo/processImages.js';
import getFirstMp4File from './getVideo/getvidfile.js';
import path from 'path';
import DownloadVideo from './getVideo/downloadvideo.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const directoryPath = './video-dataset'
const outputFilePath = './results.json'
console.log(directoryPath);
console.log(outputFilePath);

let videoPath;
const rocketType = argv.r || 'Starship';

async function main() {
    videoPath = argv.v || (await getFirstMp4File(directoryPath))
    if (!videoPath) {
        console.error('No video provided and no MP4 files found in the video-dataset folder.');
        return;
    }
    console.log(`Using video: ${videoPath}`);
    try {
        if( /^https?:\/\//.test(videoPath)) {
            let videoLink = videoPath;
            const outputVideoPath = path.join(__dirname, 'video-dataset', 'launch-footage.mp4');
            videoPath = await DownloadVideo(videoLink, outputVideoPath);
        }
        await extractFrames(videoPath);
        await processImages(directoryPath, outputFilePath);
        getExcelSheet(outputFilePath);
    } catch (err) {
        console.error('Error:', err);
    }
}

main();