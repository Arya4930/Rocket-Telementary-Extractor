import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function CropImages(directoryPath) {
    const files = fs
        .readdirSync(directoryPath)
        .filter((file) => /^frame_\d{4}\.png$/.test(file));

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const tempFilePath = path.join(directoryPath, `temp_${file}`);

        try {
            await sharp(filePath)
                .extract({ left: 0, top: 890, width: 1920, height: 190 })
                .toFile(tempFilePath);

            if (fs.existsSync(tempFilePath)) {
                fs.renameSync(tempFilePath, filePath);
            } else {
                console.error(`Temp file not found: ${tempFilePath}`);
            }
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
}
