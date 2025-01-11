import fs from 'fs/promises'
import path from 'path'

export default async function getFirstMp4File(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);
        const mp4File = files.find((file) =>
            ['.mp4', '.mkv', '.mov', '.avi'].some((ext) => file.endsWith(ext))
        );

        if (!mp4File) {
            throw new Error('No video files found in the directory.');
        }

        return path.join(directoryPath, mp4File);
    } catch (err) {
        console.error('Error reading directory:', err.message);
        throw err;
    }
}