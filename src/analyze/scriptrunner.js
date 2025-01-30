import { spawn } from 'child_process';

const __dirname = import.meta.dirname;

const InputPath = `${__dirname}../../results.json`;
const OutputPath = `${__dirname}../../results-filtered.json`;

async function AnalyzeData(InputPath) {
    const pythonProcess = spawn('python', ['./src/analyze/analyze.py']);
    pythonProcess.stdin.write(InputPath);
    pythonProcess.stdin.end();
}

AnalyzeData(InputPath);
