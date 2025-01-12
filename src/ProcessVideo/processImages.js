import fs from 'fs';
import path from 'path'
import analyzeImageFromFile from './analyzeImageFromFile.js';

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

export default async function processImages(directoryPath, outputFilePath) {
    const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.png'));
    const results = [];

    let skipcount = 0
    let InCommingData = false

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (skipcount > 0) {
            skipcount--;
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete ${filePath}: ${err.message}`);
            }
            continue;
        }
        console.log(`Processing ${filePath}`);
        const data = await analyzeImageFromFile(filePath);
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            console.log(`No data found for ${filePath}. Skipping...`);
            fs.unlinkSync(filePath);
            continue;
        } else if ( isInt(data) && InCommingData == false ){
            skipcount = data - 5;
            console.log(`Skipping the next ${data} files...`);
        }
        results.push({ file: file, ...data });
        InCommingData = true;
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${outputFilePath}`);
}