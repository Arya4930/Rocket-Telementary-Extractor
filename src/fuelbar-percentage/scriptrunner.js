import { spawn } from 'child_process';
import sharp from 'sharp';
import fs from 'fs';

export async function GetBoosterFuel(img) {
    try {
        await sharp(img)
            .extract({ left: 276, top: 1000, width: 240, height: 13 })
            .toFile(`${img}.boosterlox.png`);

        await sharp(img)
            .extract({ left: 276, top: 1036, width: 240, height: 13 })
            .toFile(`${img}.boosterlch4.png`);
    } catch (err) {
        console.error(
            `Error in image processing for booster fuel: ${err.message}`
        );
        throw err;
    }

    return new Promise((resolve, reject) => {
        try {
            const pythonProcess = spawn('python', [
                './src/fuelbar-percentage/getFuel.py'
            ]);

            pythonProcess.stdin.write(
                `${img}.boosterlox.png\n${img}.boosterlch4.png`
            );
            pythonProcess.stdin.end();

            let result = '';
            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stdout.on('end', () => {
                try {
                    resolve(result.trim());
                    fs.unlinkSync(`${img}.boosterlox.png`);
                    fs.unlinkSync(`${img}.boosterlch4.png`);
                } catch (err) {
                    console.error(
                        `Error deleting temporary files: ${err.message}`
                    );
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                reject(`Python Error: ${data.toString()}`);
            });
        } catch (err) {
            reject(`Error spawning Python process: ${err.message}`);
        }
    }).catch((err) => {
        console.error(`Error in GetBoosterFuel: ${err}`);
        throw err;
    });
}

export async function GetShipFuel(img) {
    try {
        await sharp(img)
            .extract({ left: 1455, top: 1000, width: 240, height: 13 })
            .toFile(`${img}.shiplch4.png`);

        await sharp(img)
            .extract({ left: 1455, top: 1031, width: 240, height: 13 })
            .toFile(`${img}.shiplox.png`);
    } catch (err) {
        console.error(
            `Error in image processing for ship fuel: ${err.message}`
        );
        throw err;
    }

    return new Promise((resolve, reject) => {
        try {
            const pythonProcess = spawn('python', [
                './src/fuelbar-percentage/getFuel.py'
            ]);

            pythonProcess.stdin.write(
                `${img}.shiplox.png\n${img}.shiplch4.png`
            );
            pythonProcess.stdin.end();

            let result = '';
            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stdout.on('end', () => {
                try {
                    resolve(result.trim());
                    fs.unlinkSync(`${img}.shiplox.png`);
                    fs.unlinkSync(`${img}.shiplch4.png`);
                } catch (err) {
                    console.error(
                        `Error deleting temporary files: ${err.message}`
                    );
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                reject(`Python Error: ${data.toString()}`);
            });
        } catch (err) {
            reject(`Error spawning Python process: ${err.message}`);
        }
    }).catch((err) => {
        console.error(`Error in GetShipFuel: ${err}`);
        throw err;
    });
}
