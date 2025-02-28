import fs from 'fs';
import CreateClient from '@azure-rest/ai-vision-image-analysis';
const createClient = CreateClient.default;
import { AzureKeyCredential } from '@azure/core-auth';
import Vehicles from './vehicles.js';
import { GetFuel } from './fuel/scriptrunner.js';
import { IncremenetTimeBy1second } from '../utils/Functions.js';
import { GetTilt } from './tilt/scriptrunner.js';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

const credential = new AzureKeyCredential(process.env.VISION_KEY);
const client = createClient(process.env.VISION_ENDPOINT, credential);
const vehicleInstances = new Vehicles();

const features = ['Read'];

export default async function analyzeImageFromFile(
    imagePath,
    rocketType,
    Temptime
) {
    try {
        const imageData = fs.readFileSync(imagePath);

        const ImageReadStart = performance.now();
        const result = await client.path('/imageanalysis:analyze').post({
            body: imageData,
            queryParameters: {
                features: features
            },
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        const iaResult = result.body;
        const ImageReadEnd = performance.now();
        console.log(
            chalk.yellow.bold(
                `Time taken to Text Data off Frame: ${((ImageReadEnd - ImageReadStart) / 1000).toFixed(2)}s.`
            )
        );

        let time = null;

        if (iaResult.readResult && iaResult.readResult.blocks) {
            const words = iaResult.readResult.blocks.flatMap((block) =>
                block.lines.flatMap((line) =>
                    line.words.map((word) => ({
                        text: word.text,
                        boundingPolygon: word.boundingPolygon
                    }))
                )
            );

            if (!Temptime) {
                const patterns = [
                    {
                        regex: /^T\+\d{2}:\d{2}:\d{2}$/,
                        transform: (text) => text.substring(2)
                    },
                    {
                        regex: /^T\+\d{2}[:.]\d{2}[:.]\d{2}$/,
                        transform: (text) => text.substring(2).replace('.', ':')
                    },
                    {
                        regex: /^\d{1,2}:\d{2}:\d{2}$/,
                        transform: (text) => text
                    },
                    {
                        regex: /^:\d{1,2}:\d{2}$/,
                        transform: (text) => `00${text}`
                    },
                    {
                        regex: /^\d{1,2}:\d{2}$/,
                        transform: (text) => `00:${text}`
                    },
                    {
                        regex: /^\d{3}:\d{2}$/,
                        transform: (text) => `00:${text.substring(1)}`
                    },
                    {
                        regex: /^\+\d{1,2}:\d{2}:\d{2}$/,
                        transform: (text) => text.substring(1)
                    },
                    {
                        regex: /^[A-Z]{2}:\d{2}:\d{2}$/,
                        transform: (text) => `00${text.substring(2)}`
                    }
                ];

                let plustime;

                for (const word of words) {
                    if (/^T\-\d{1,2}:\d{2}:\d{2}$/.test(word.text)) {
                        const t = word.text
                            .substring(2)
                            .split(':')
                            .map((e) => Number(e));
                        plustime = t[0] * 3600 + t[1] * 60 + t[2];
                    } else {
                        for (const { regex, transform } of patterns) {
                            if (regex.test(word.text)) {
                                time = transform(word.text);
                            }
                        }
                    }
                }
                if (plustime) return plustime;
                if (!time) return;
            } else {
                time = IncremenetTimeBy1second(Temptime);
            }

            if (rocketType === 'Starship') {
                const Fuelstart = performance.now();
                const Fuel = await GetFuel(imagePath);
                const Fuelend = performance.now();
                console.log(
                    chalk.yellow.bold(
                        `Time taken to Get Fuel Data: ${((Fuelend - Fuelstart) / 1000).toFixed(2)}s.`
                    )
                );
                const Tiltstart = performance.now();
                const Tilt = await GetTilt(imagePath);
                const Tiltend = performance.now();
                console.log(
                    chalk.yellow.bold(
                        `Time taken to Get Tilt Data: ${((Tiltend - Tiltstart) / 1000).toFixed(2)}s.`
                    )
                );
                return vehicleInstances.starship(words, time, Fuel, Tilt);
            } else if (rocketType === 'new_glenn') {
                return vehicleInstances.new_glenn(words, time);
            }
        }
    } catch (error) {
        if (error.code === 'ENOTFOUND') {
            console.log(
                'Error analyzing frame: Not able to get Azure Cognitive services'
            );
        } else {
            console.error('Error analyzing image:', error);
        }
    }
}
