import { spawn } from 'child_process';
import sharp from 'sharp';

export default async function analyzeImage(imgPath) {
    sharp(imgPath)
        .extract({ left: 270, top: 990, width: 260, height: 65 })
        .toFile(`../../video-dataset/${imgPath}.png`, function (err) {
            if (err) console.log(err);
        });

    sharp(imgPath)
        .extract({ left: 1380, top: 980, width: 350, height: 100 })
        .toFile('./kangta.ship.png', function (err) {
            if (err) console.log(err);
        });

    const pythonProcess = spawn('python', ['./main.py']);
    pythonProcess.stdin.write(`../../${imgPath}.png`);
    pythonProcess.stdin.end();
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data}`);
    });
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });
    pythonProcess.on('exit', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
}
