import fs from 'fs/promises';
import path from 'path';

const excludedFolders = [
    '.vscode',
    'data',
    'node_modules',
    'plots',
    'src',
    '.git'
];

async function findVideoDatasetFolder(directoryPath) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory() && !excludedFolders.includes(entry.name)) {
            const videoDatasetPath = path.join(
                directoryPath,
                entry.name,
                'video-dataset'
            );
            try {
                const files = await fs.readdir(videoDatasetPath);
                const mp4File = files.find((file) =>
                    ['.mp4', '.mkv', '.mov', '.avi'].some((ext) =>
                        file.endsWith(ext)
                    )
                );

                if (mp4File) {
                    return path.join(videoDatasetPath, mp4File);
                }
            } catch (err) {
                console.log(
                    `Error reading directory ${videoDatasetPath}:`,
                    err.message
                );
            }
        }
    }
    throw new Error('No video files found in any video-dataset folder.');
}

export default async function getFirstMp4File(directoryPath) {
    try {
        return await findVideoDatasetFolder(directoryPath);
    } catch (err) {
        console.error('Error:', err.message);
        throw err;
    }
}
