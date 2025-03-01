import { parentPort } from 'worker_threads';
import analyzeImageFromFile from './analyzeImageFromFile.js';

parentPort.on('message', async ({ imagePath, rocketType, Temptime }) => {
    try {
        const result = await analyzeImageFromFile(
            imagePath,
            rocketType,
            Temptime
        );
        parentPort.postMessage(result);
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});
