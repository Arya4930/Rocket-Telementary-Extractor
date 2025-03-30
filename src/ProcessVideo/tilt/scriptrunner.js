import { CropImagesToAnalyze } from '../../utils/Functions.js';
import { tiltWorkerPool } from '../workerpool.js';

export async function GetTilt(img, i, totalSeconds) {
    const regions = [
        {
            name: 'Shiptilt',
            left: 1169,
            top: 3 + 190 * i,
            width: 180,
            height: 180
        }
    ];
    if (totalSeconds <= 420) {
        regions.unshift({
            name: 'Boostertilt',
            left: 550,
            top: 3 + 190 * i,
            width: 180,
            height: 180
        });
    }

    const fileNames = await CropImagesToAnalyze(img, regions);
    return Promise.all(fileNames.map((file) => tiltWorkerPool.runTask(file)));
}
