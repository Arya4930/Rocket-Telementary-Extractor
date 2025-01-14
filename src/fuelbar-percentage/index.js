import { spawn } from 'child_process';
import sharp from 'sharp';

export async function GetBoosterFuel(imgPath) {
    sharp(imgPath)
        .extract({ left: 200, top: 980, width: 340, height: 100 })
        .toFile(`${imgPath}.booster.edited.png`, function (err) {
            if (err) console.log(err);
        });

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            './src/fuelbar-percentage/main.py'
        ]);

        // Pass the image path to the Python process
        pythonProcess.stdin.write(`${imgPath}.booster.edited.png`);
        pythonProcess.stdin.end();

        let result = '';
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString(); // Collect output
        });

        pythonProcess.stdout.on('end', () => {
            resolve(result.trim()); // Resolve when the process ends
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(`Python Error: ${data.toString()}`); // Reject on error
        });
    });
}

export async function GetShipFuel(imgPath) {
    sharp(imgPath)
        .extract({ left: 1300, top: 980, width: 430, height: 100 })
        .toFile(`${imgPath}.ship.edited.png`, function (err) {
            if (err) console.log(err);
        });

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            './src/fuelbar-percentage/main.py'
        ]);

        // Pass the image path to the Python process
        pythonProcess.stdin.write(`${imgPath}.ship.edited.png`);
        pythonProcess.stdin.end();

        let result = '';
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString(); // Collect output
        });

        pythonProcess.stdout.on('end', () => {
            resolve(result.trim()); // Resolve when the process ends
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(`Python Error: ${data.toString()}`); // Reject on error
        });
    });
}
