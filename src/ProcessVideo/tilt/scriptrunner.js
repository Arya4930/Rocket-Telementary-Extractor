import { CropImagesToAnalyze } from '../../utils/Functions.js';
import { tiltWorkerPool } from '../fuel/workerpool.js';

export async function GetTilt(img) {
    const regions = [
        { name: 'Boostertilt', left: 550, top: 3, width: 180, height: 180 },
        { name: 'Shiptilt', left: 1169, top: 3, width: 180, height: 180 }
    ];

    const fileNames = await CropImagesToAnalyze(img, regions);
    return Promise.all(fileNames.map((file) => tiltWorkerPool.runTask(file)));
}
