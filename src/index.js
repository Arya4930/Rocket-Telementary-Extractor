import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import 'dotenv/config';
import getExcelSheet from './finalize/getExcelSheet.js';
import extractFrames from './getVideo/extractframes.js';
import processImages from './ProcessVideo/processImages.js';
import getFirstMp4File from './getVideo/getvidfile.js';
import { getVideoTitle } from './getVideo/downloadvideo.js';
import path from 'path';
import DownloadVideo from './getVideo/downloadvideo.js';
import fs from 'fs';
import minimist from 'minimist';
import { finalizeJsonFile } from './finalize/finalizeJson.js';

const argv = minimist(process.argv.slice(2));
ffmpeg.setFfmpegPath(ffmpegPath.path);

const __dirname = import.meta.dirname;

let videoPath;
let title;

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
    process.on(signal, async () => {
        console.log('\n🛑 Finalizing JSON file...');
        await finalizeJsonFile();
        process.exit();
    })
);
process.on('exit', async () => await finalizeJsonFile());
process.on('uncaughtException', async (err) => {
    console.error('❌ Uncaught Exception:', err);
    await finalizeJsonFile();
    process.exit(1);
});

export async function main() {
    const allfiles = path.join(__dirname, '../');
    videoPath = argv.v || (await getFirstMp4File(allfiles));
    const rocketType = argv.r || 'Starship';
    if (!videoPath) {
        console.error(
            'No video provided and no MP4 files found in the video-dataset folder.'
        );
        return;
    }
    console.log(`Using video: ${videoPath}`);
    let videotitle = videoPath.split('\\');
    if (videoPath.length > 0) {
        title = videotitle[videotitle.length - 3];
    }
    try {
        if (/^https?:\/\//.test(videoPath)) {
            title = await getVideoTitle(videoPath);
            let videoLink = videoPath;
            const outputVideoPath = path.join(
                __dirname,
                '../',
                title,
                'video-dataset',
                'launch-footage.mp4'
            );
            videoPath = await DownloadVideo(videoLink, outputVideoPath);
        }
        const directoryPath = path.join(__dirname, `../${title}/video-dataset`);
        const outputFilePath = path.join(__dirname, `../${title}/results.json`);
        const excelPath = path.join(__dirname, `../${title}/results.xlsx`);
        const alltitlefiles = path.join(__dirname, `../${title}`);
        const files = await fs.promises.readdir(directoryPath);
        if (!files.some((file) => file.startsWith('frame_'))) {
            await extractFrames(videoPath, directoryPath);
        }
        const allfiles2 = await fs.promises.readdir(alltitlefiles);
        if (!allfiles2.includes('results.json')) {
            await processImages(directoryPath, outputFilePath, rocketType);
        }
        getExcelSheet(outputFilePath, excelPath);
        process.exit(1);
    } catch (err) {
        console.error('Error:', err);
        console.log('\n🛑 Finalizing JSON file...');
        await finalizeJsonFile();
    }
}

main();
