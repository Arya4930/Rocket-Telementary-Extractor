import { default as yt } from 'yt-dlp-wrap';
const YTDlpWrap = yt.default;
import path from 'path';
import fs from 'fs';

const __dirname = import.meta.dirname;
let ytDlpBinaryPath = path.join(__dirname, 'yt-dlp.exe');

async function ensureYTDlpBinary() {
    if (!fs.existsSync(ytDlpBinaryPath)) {
        console.log('Downloading yt-dlp binary...');
        try {
            await YTDlpWrap.downloadFromGithub(ytDlpBinaryPath);
            console.log('yt-dlp binary downloaded successfully.');
        } catch (error) {
            console.error('Failed to download yt-dlp:', error);
            throw error;
        }
    } else {
        console.log('yt-dlp binary already exists.');
    }
}

export default async function DownloadVideo(videoURL, outputPath) {
    try {
        await ensureYTDlpBinary();

        const ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);
        console.log('Starting video download...');

        return new Promise((resolve, reject) => {
            let ytDlpEventEmitter = ytDlpWrap
                .exec([
                    videoURL,
                    '-f',
                    'bv*[height=1080]',
                    '-o',
                    outputPath,
                    '--no-audio'
                ])
                .on('ytDlpEvent', (eventType, eventData) =>
                    console.log(eventType, eventData)
                )
                .on('error', (error) => {
                    console.error('Download failed due to error:', error);
                    reject(error);
                })
                .on('close', (code) => {
                    if (code !== 0) {
                        console.error('Error: 1080p video is not available.');
                        reject(new Error('1080p video is unavailable.'));
                    } else {
                        console.log('Download completed successfully.');
                        resolve(outputPath);
                    }
                });

            console.log(
                `yt-dlp process PID: ${ytDlpEventEmitter.ytDlpProcess.pid}`
            );
            console.log(`Video saved to ${outputPath}`);
        });
    } catch (err) {
        console.error('Download failed:', err.message);
    }
}

export async function getVideoTitle(videoURL) {
    try {
        await ensureYTDlpBinary();
        const ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);
        let metadata = await ytDlpWrap.getVideoInfo(videoURL);
        let title = metadata.title.trim();

        title = title.replace(/[<>:"'/\\|?*]+/g, '');

        return title;
    } catch (error) {
        console.error('Failed to get video title:', error);
        return null;
    }
}
