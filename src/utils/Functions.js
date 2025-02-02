import fs from 'fs';
import path from 'path';
import getFirstMp4File from '../getVideo/getvidfile.js';

export function IncremenetTimeBy1second(time) {
    let timeParts = time.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);
    seconds += 1;
    if (seconds >= 60) {
        seconds = 0;
        minutes += 1;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isInt(value) {
    return (
        !isNaN(value) &&
        (function (x) {
            return (x | 0) === x;
        })(parseFloat(value))
    );
}

const __dirname = import.meta.dirname;
export async function finalizeJsonFile() {
    try {
        const allfiles = path.join(__dirname, '../../');
        const InputPath = await getFirstMp4File(allfiles);
        const outputFilePath = path.join(`${InputPath}/../../results.json`);
        if (!fs.existsSync(outputFilePath)) return;

        let jsonString = fs.readFileSync(outputFilePath, 'utf8').trim();
        if (jsonString.endsWith(']')) {
            console.log('✅ JSON already valid.');
            return;
        }
        jsonString = jsonString.replace(/,\s*$/, '');
        if (!jsonString.endsWith(']')) {
            jsonString += '\n]';
        }
        fs.writeFileSync(outputFilePath, jsonString, 'utf8');
        console.log('✅ JSON file finalized properly.');
    } catch (error) {
        console.error('❌ Error finalizing JSON file:', error);
    }
}
