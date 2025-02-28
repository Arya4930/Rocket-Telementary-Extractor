import { parentPort } from 'worker_threads';
import { spawn } from 'child_process';
import fs from 'fs';

parentPort.on('message', (filePath) => {
    const pythonProcess = spawn('python', [
        './src/ProcessVideo/fuel/getFuel.py',
        filePath
    ]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stdout.on('end', () => {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`Error deleting file ${filePath}: ${err.message}`);
        }
        parentPort.postMessage(result.trim());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error (${filePath}): ${data.toString()}`);
        parentPort.postMessage(`Python Error: ${data.toString()}`);
    });
});
