import path from 'path';
import { fileURLToPath } from 'url';
import getFirstMp4File from '../getVideo/getvidfile.js';
import getExcelSheet from './getExcelSheet.js';
import fs from 'fs';

async function fix() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const allfiles = path.join(__dirname, '../../');
    const InputPath = await getFirstMp4File(allfiles);
    const outputFilePath = path.join(`${InputPath}/../../results.json`);
    const excelPath = path.join(`${InputPath}/../../results.xlsx`);
    getExcelSheet(outputFilePath, excelPath);
}

fix();
