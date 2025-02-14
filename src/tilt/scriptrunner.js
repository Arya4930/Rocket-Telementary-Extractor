// import workerpool from '../fuel/workerpool.js';
// import CropImages from '../ProcessVideo/Croplmages.js';

// export async function GetTilt(img) {
//     const regions = [
//         { name: 'Shiptilt', left: 1169, top: 13, width: 180, height: 180 },
//         { name: 'Boostertilt', left: 550, top: 13, width: 180, height: 180 }
//     ];

//     const fileNames = await CropImages(img, regions);
//     return Promise.all(fileNames.map((file) => workerpool.runTask(file)));
// }
