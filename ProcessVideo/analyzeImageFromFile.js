import fs from 'fs';
import CreateClient from '@azure-rest/ai-vision-image-analysis';
const createClient = CreateClient.default;
import { AzureKeyCredential } from '@azure/core-auth';
import Vehicles from './vehicles.js';

const credential = new AzureKeyCredential(process.env.VISION_KEY);
const client = createClient(process.env.VISION_ENDPOINT, credential);
const vehicleInstances = new Vehicles()

const features = ['Read'];

export default async function analyzeImageFromFile(imagePath) {
    try {
        const imageData = fs.readFileSync(imagePath);

        const result = await client.path('/imageanalysis:analyze').post({
            body: imageData,
            queryParameters: {
                features: features,
            },
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        const iaResult = result.body;

        let time = null;

        if (iaResult.readResult && iaResult.readResult.blocks) {
            const words = iaResult.readResult.blocks.flatMap(block =>
                block.lines.flatMap(line =>
                    line.words.map(word => ({
                        text: word.text,
                        boundingPolygon: word.boundingPolygon
                    }))
                )
            );
            let a = []
            words.filter(word => {
                return (word.boundingPolygon[2].x < 400 && word.boundingPolygon[2].y < 1100)
            }).map(word => {
                a.push(word.text)
            })
            // const filteredWords = a.filter(word => {
            //     // Check if word is a valid number (integer or float)
            //     const isNumber = /^\d+(\.\d+)?$/.test(word);

            //     // Check if word matches the time pattern 'T+00:XX:XX'
            //     const isTime = /^00:\d{2}:\d{2}$/.test(word);
            //     const isKeyword = /^(KM\/H|KM)$/.test(word); // Matches 'KM/H' or 'KM'

            //     return isNumber || isTime ||  isKeyword;
            // });

            // words.forEach((word, index) => {
            //     if (word.startsWith('T-') || word.startsWith('T+')) {
            //         time = word.split`+`[1];
            //     } else if (word.includes('KM/H')) {
            //         speed = words[index - 1];
            //     } else if (word.includes('ALTITUDE')) {
            //         altitude = words[index + 1];
            //     }
            // });

            await words.forEach(word => {
                if (/^T\+\d{2}:\d{2}:\d{2}$/.test(word.text)) {
                    time = word.text.substring(2)
                }
            });

            if (!time) return;

            return vehicleInstances.starship(words, time)
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
    }
}