import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import getFirstMp4File from '../getVideo/getvidfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const allfiles = path.join(__dirname, '../../');

async function AnalyzeData() {
    try {
        const InputPath = await getFirstMp4File(allfiles);
        const outputFilePath = path.join(`${InputPath}/../../results.json`);
        const pythonProcess = spawn('python', ['./src/analyze/analyze.py'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        pythonProcess.stdin.write(outputFilePath + '\n');
        pythonProcess.stdin.write(`${InputPath}/../../plots\n`);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

AnalyzeData();
