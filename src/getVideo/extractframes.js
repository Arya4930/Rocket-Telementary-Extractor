import ffmpeg from 'fluent-ffmpeg';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { updateProgressBar } from '../utils/Croplmages.js';

export default async function extractFrames(videopath, directoryPath) {
    return new Promise(async (resolve, reject) => {
        let processed = 0;
        let total = await getVideoDurationInSeconds(videopath);
        ffmpeg(videopath)
            .videoFilters('fps=1')
            .output(`${directoryPath}/frame_%05d.png`)
            .noAudio()
            .on('start', function (commandLine) {
                console.log('Started: ' + commandLine);
            })
            .on('progress', function (progress) {
                updateProgressBar(progress.frames, total, 'Extracting Frames');
            })
            .on('error', function (err) {
                reject('An error occurred: ' + err.message);
            })
            .on('end', function () {
                console.log('\nProcessing finished!');
                resolve();
            })
            .run();
    });
}
