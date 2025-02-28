import { fuelWorkerPool } from './workerpool.js';
import { CropImagesToAnalyze } from '../../utils/Functions.js';

export async function GetFuel(img) {
    const regions = [
        { name: 'boosterlox', left: 276, top: 116, width: 240, height: 1 },
        { name: 'boosterlch4', left: 276, top: 152, width: 240, height: 1 },
        { name: 'shiplox', left: 1455, top: 116, width: 240, height: 1 },
        { name: 'shiplch4', left: 1455, top: 147, width: 240, height: 1 }
    ];

    const fileNames = await CropImagesToAnalyze(img, regions);
    return Promise.all(fileNames.map((file) => fuelWorkerPool.runTask(file)));
}
