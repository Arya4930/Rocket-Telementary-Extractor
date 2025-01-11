const Ffmpeg = require("fluent-ffmpeg")

async function DownloadVideo(url, outputPath){
    return new Promise((resolve, reject) => {
        Ffmpeg(url)
            .output(outputPath)
            .on('start', (commandLine) => {
                console.log('Downloading video with command: ', commandLine);
            })
            .on('error', (err) => {
                reject('Failed to download the video: ', err.message);
            })
            .on('end', () => {
                console.log('Video downloaded to: ', outputPath);
                resolve(outputPath)
            })
            .run();
    });
}

module.exports = DownloadVideo;