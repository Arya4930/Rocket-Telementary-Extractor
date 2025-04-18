import fs from 'fs';
import CreateClient from '@azure-rest/ai-vision-image-analysis';
const createClient = CreateClient.default;
import { AzureKeyCredential } from '@azure/core-auth';
import { createWorker } from 'tesseract.js';
import Vehicles from './vehicles.js';
import { GetFuel } from './fuel/scriptrunner.js';
import {
    CropImagesToAnalyze,
    IncremenetTimeBy1second
} from '../utils/Functions.js';
import { GetTilt } from './tilt/scriptrunner.js';
import { GetEngines } from './engines/srciptrunner.js';

const credential = new AzureKeyCredential(process.env.VISION_KEY);
const client = createClient(process.env.VISION_ENDPOINT, credential);
const vehicleInstances = new Vehicles();

const features = ['Read'];

export async function getWordsFromAzure(imagePath) {
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
        if (iaResult.readResult && iaResult.readResult.blocks) {
            const words = iaResult.readResult.blocks.flatMap((block) =>
                block.lines.flatMap((line) =>
                    line.words.map((word) => word.text.trim())
                )
            );
            return words ? words : 0;
        }
    } catch (err) {
        console.error(`Error reading image with Azure: ${err}`);
        return 0;
    }
}

export async function getWordsFromTesseract(imagePath, filter = false) {
    try {
        const imageData = fs.readFileSync(imagePath);
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imageData);
        await worker.terminate();

        let words = ret.data.text
            .trim()
            .split('\n')
            .map((word) => (word == '[1]' ? '0' : word));

        if (filter) {
            words = words.filter((value) => /^\d+$/.test(value));
        }
        return words;
    } catch (err) {
        console.error(`Error reading image with Tesseract: ${err.message}`);
        return 0;
    }
}

let isPlusTime = false;

export default async function analyzeImageFromFile(
    imagePath,
    rocketType,
    Temptime,
    InCommingData
) {
    try {
        let words;
        let Fuel = new Array(4).fill(null);
        let Tilt = new Array(2).fill(null);
        let Engines = new Array(2).fill(null);
        let time = null;
        if (!InCommingData && !Temptime) {
            if (isPlusTime) {
                words = await getWordsFromAzure(imagePath);
            } else {
                words = await Promise.race([
                    // getWordsFromAzure(imagePath),
                    getWordsFromTesseract(imagePath)
                ]).then((res) => res.flat());
            }
            const patterns = [
                {
                    regex: /^T\+\d{2}:\d{2}:\d{2}$/,
                    transform: (text) => text.substring(2)
                },
                {
                    regex: /^T\+\d{2}[:.]\d{2}[:.]\d{2}$/,
                    transform: (text) => text.substring(2).replace('.', ':')
                }
            ];

            let plustime = 0;

            for (const word of words) {
                const SeperatedWords = word.split(` `);
                for (const SeperatedWord of SeperatedWords) {
                    if (/^T\-\d{2}:\d{2}:\d{2}$/.test(SeperatedWord)) {
                        const t = SeperatedWord.substring(2)
                            .split(':')
                            .map((e) => Number(e));
                        plustime = t[0] * 3600 + t[1] * 60 + t[2];
                    } else {
                        for (const { regex, transform } of patterns) {
                            if (regex.test(SeperatedWord)) {
                                time = transform(SeperatedWord);
                            }
                        }
                    }
                }
            }
            if (plustime) {
                isPlusTime = true;
                return plustime;
            }
            if (!time) return;
        }

        if (rocketType === 'Starship') {
            if (!time && Temptime) time = Temptime;
            if (InCommingData) {
                const allTelemetryData = [];

                for (let i = 0; i < 5; i++) {
                    const timeParts = time.split(':').map(Number);
                    const totalSeconds =
                        timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];

                    let regions = [
                        {
                            name: 'ShipStats',
                            left: 1530,
                            top: 15 + 190 * i,
                            width: 100,
                            height: 75
                        }
                    ];
                    if (totalSeconds <= 420) {
                        regions.unshift({
                            name: 'boosterStats',
                            left: 350,
                            top: 15 + 190 * i,
                            width: 100,
                            height: 75
                        });
                    }

                    const fileNames = await CropImagesToAnalyze(
                        imagePath,
                        regions
                    );
                    const [words, Fuel, Tilt, Engines] = await Promise.all([
                        Promise.all(
                            fileNames.map((file) =>
                                Promise.race([
                                    // getWordsFromAzure(file)
                                    getWordsFromTesseract(file, true)
                                ])
                            )
                        ).then((res) => res.flat()),

                        GetFuel(imagePath, i, totalSeconds),
                        GetTilt(imagePath, i, totalSeconds),
                        GetEngines(imagePath, i, totalSeconds)
                    ]);

                    fileNames.map((file) => fs.unlinkSync(file));
                    if (words == 0) {
                        const emptData = {
                            time: time,
                            ship_speed: 0,
                            ship_altitude: 0,
                            ship_LOX_Percent: 0,
                            ship_CH4_Percent: 0,
                            ship_Tilt: 0,
                            ship_engines: 0,
                            ...(totalSeconds <= 420 && {
                                booster_speed: 0,
                                booster_altitude: 0,
                                booster_LOX_Percent: 0,
                                booster_CH4_Percent: 0,
                                booster_tilt: 0,
                                booster_engines: 0
                            })
                        };
                        allTelemetryData.push(emptData);
                        continue;
                    }

                    const telemetryData = vehicleInstances.starship(
                        words,
                        time,
                        Fuel,
                        Tilt,
                        Engines,
                        InCommingData
                    );

                    Temptime = IncremenetTimeBy1second(Temptime);
                    time = Temptime;

                    allTelemetryData.push(telemetryData);
                }
                return Object.values(allTelemetryData);
            }
            if (words == 0) return;
            return vehicleInstances.starship(
                words,
                time,
                Fuel,
                Tilt,
                Engines,
                InCommingData
            );
        } else if (rocketType === 'new_glenn') {
            return vehicleInstances.new_glenn(words, time);
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
