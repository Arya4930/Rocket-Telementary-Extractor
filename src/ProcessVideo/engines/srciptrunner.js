import { EngineWorkerPool } from '../workerpool.js';
import { CropImagesToAnalyze } from '../../utils/Functions.js';

export async function GetEngines(img, i, totalSeconds) {
    const regions = [
        {
            name: 'shipengines',
            left: 1732,
            top: 15 + 190 * i,
            width: 165,
            height: 155
        }
    ];

    if (totalSeconds <= 420) {
        regions.unshift({
            name: 'boosterengines',
            left: 30,
            top: 15 + 190 * i,
            width: 155,
            height: 155
        });
    }

    const fileNames = await CropImagesToAnalyze(img, regions);
    return Promise.all(fileNames.map((file) => EngineWorkerPool.runTask(file)));
}
