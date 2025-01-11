const ffmpeg = require('fluent-ffmpeg')

function extractFrames(videopath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videopath)
            .videoFilters('fps=1')
            .output('./video-dataset/frame_%04d.png')
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

module.exports = extractFrames;