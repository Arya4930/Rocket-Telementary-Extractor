import { EngineWorkerPool } from '../workerpool.js';
import { CropImagesToAnalyze } from '../../utils/Functions.js';

export async function GetEngines(img) {
    const regions = [
        { name: 'boosterengines', left: 30, top: 15, width: 155, height: 155 },
        { name: 'shipengines', left: 1732, top: 15, width: 165, height: 155 }
    ];

    const fileNames = await CropImagesToAnalyze(img, regions);
    return Promise.all(fileNames.map((file) => EngineWorkerPool.runTask(file)));
}
