import fs from 'fs';
import CreateClient from '@azure-rest/ai-vision-image-analysis';
const createClient = CreateClient.default;
import { AzureKeyCredential } from '@azure/core-auth';
import Vehicles from './vehicles.js';
import { GetBoosterFuel, GetShipFuel } from '../fuel/scriptrunner.js';
import { IncremenetTimeBy1second } from '../utils/Functions.js';

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
                const BoosterFuel = await GetBoosterFuel(imagePath);
                const shipFuel = await GetShipFuel(imagePath);
                return vehicleInstances.starship(
                    words,
                    time,
                    shipFuel,
                    BoosterFuel
                );
            } else if (rocketType === 'new_glenn') {
                return vehicleInstances.new_glenn(words, time);
            }
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
    }
}
