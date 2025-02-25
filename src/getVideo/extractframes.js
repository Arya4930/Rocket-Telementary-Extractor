import ffmpeg from 'fluent-ffmpeg';

export default async function extractFrames(videopath, directoryPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videopath)
            .videoFilters('fps=1')
            .output(`${directoryPath}/frame_%05d.png`)
            .noAudio()
            .on('start', function (commandLine) {
                console.log('Started: ' + commandLine);
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
