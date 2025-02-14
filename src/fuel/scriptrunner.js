import sharp from 'sharp';
import workerpool from './workerpool.js';
import CropImages from '../ProcessVideo/Croplmages.js';

export async function GetFuel(img) {
    const regions = [
        { name: 'boosterlox', left: 276, top: 116, width: 240, height: 1 },
        { name: 'boosterlch4', left: 276, top: 152, width: 240, height: 1 },
        { name: 'shiplox', left: 1455, top: 116, width: 240, height: 1 },
        { name: 'shiplch4', left: 1455, top: 147, width: 240, height: 1 }
    ];

    const fileNames = await CropImages(img, regions);
    return Promise.all(fileNames.map((file) => workerpool.runFuelTask(file)));
}
