import path from 'path';
import getFirstMp4File from '../getVideo/getvidfile.js';
import getExcelSheet from './getExcelSheet.js';
import fs from 'fs';

export async function finalizeJsonFile() {
    try {
        const __dirname = import.meta.dirname;
        const allfiles = path.join(__dirname, '../../');
        const InputPath = await getFirstMp4File(allfiles);
        const outputFilePath = path.join(`${InputPath}/../../results.json`);
        console.log('📂 JSON File Path:', outputFilePath);

        if (!fs.existsSync(outputFilePath)) {
            console.log('⚠️ JSON file does not exist. Skipping...');
            return;
        }

        let jsonString = fs.readFileSync(outputFilePath, 'utf8').trim();
        if (jsonString.endsWith(']')) {
            console.log('✅ JSON already valid.');
        } else {
            jsonString = jsonString.replace(/,\s*$/, '');
            if (!jsonString.includes(']')) {
                jsonString += '\n]';
            }
            fs.writeFileSync(outputFilePath, jsonString, 'utf8');
            console.log('📌 JSON fixed and written.');
        }

        const excelPath = path.join(`${InputPath}/../../results.xlsx`);
        getExcelSheet(outputFilePath, excelPath);
        console.log('✅ JSON file finalized and Excel sheet created.');
        process.exit(1);
    } catch (error) {
        console.error('❌ Error finalizing JSON file:', error);
    }
}
