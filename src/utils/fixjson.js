import {
    VerifySpeed,
    VerifyAltitude,
    VerifyFuel,
    saveJsonToFile
} from './verifyvalues.js';

export async function fixjson(jsonData, sheet) {
    jsonData.forEach(async (item, rowIndex) => {
        if (!item.time) {
            return;
        }

        if (rowIndex > 0 && rowIndex + 1 < jsonData.length) {
            jsonData[rowIndex].booster_speed = await VerifySpeed(
                jsonData,
                rowIndex,
                'Booster'
            );
            jsonData[rowIndex].ship_speed = await VerifySpeed(
                jsonData,
                rowIndex,
                'Ship'
            );

            jsonData[rowIndex].booster_altitude = await VerifyAltitude(
                jsonData,
                rowIndex,
                'Booster'
            );
            jsonData[rowIndex].ship_altitude = await VerifyAltitude(
                jsonData,
                rowIndex,
                'Ship'
            );
            jsonData[rowIndex].booster_LOX_Percent = await VerifyFuel(
                jsonData,
                rowIndex,
                'B_lox'
            );
            jsonData[rowIndex].booster_CH4_Percent = await VerifyFuel(
                jsonData,
                rowIndex,
                'B_CH4'
            );
            jsonData[rowIndex].ship_LOX_Percent = await VerifyFuel(
                jsonData,
                rowIndex,
                'S_LOX'
            );
            jsonData[rowIndex].ship_CH4_Percent = await VerifyFuel(
                jsonData,
                rowIndex,
                'S_CH4'
            );
        }

        await saveJsonToFile(jsonData, sheet);
    });
}
