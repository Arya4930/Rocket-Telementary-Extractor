const fs = require('fs');
const path = require('path');
const analyzeImageFromFile = require('./analyzeImageFromFile')

async function processImages(directoryPath, outputFilePath) {
    const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.png'));
    const results = [];

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        console.log(`Processing ${filePath}`);
        const data = await analyzeImageFromFile(filePath);
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            console.log(`No data found for ${filePath}. Skipping...`);
            continue;
        }
        results.push({ file: file, ...data });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${outputFilePath}`);
}

module.exports = processImages;