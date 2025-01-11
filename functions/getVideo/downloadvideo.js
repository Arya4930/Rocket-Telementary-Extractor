import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import fetch from 'node-fetch'; 

async function DownloadVideo(url, dest) {
    try {
        // Fetch the URL content
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch the video: ${response.statusText}`);
        }
        const writeStream = createWriteStream(dest);
        const readable = Readable.fromWeb(response.body);
        readable.pipe(writeStream);
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log(`Download completed and saved to: ${dest}`);
    } catch (err) {
        console.error('Error during download:', err);
        throw err;  // Rethrow the error for further handling if needed
    }
}

export default DownloadVideo;