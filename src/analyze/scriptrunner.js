import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const InputPath = path.resolve(__dirname, '../../results.json');

async function AnalyzeData(InputPath) {
    const pythonProcess = spawn('python', ['./src/analyze/analyze.py'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdin.write(InputPath);
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
}

AnalyzeData(InputPath);
