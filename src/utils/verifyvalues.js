import fs from 'fs';

export async function VerifySpeed(jsonData, rowIndex, type) {
    let verifiedSpeed =
        type === 'Booster'
            ? jsonData[rowIndex].booster_speed
            : jsonData[rowIndex].ship_speed;
    let offset = 1;

    while (
        (Math.abs(
            jsonData[rowIndex - offset]?.[
                type === 'Booster' ? 'booster_speed' : 'ship_speed'
            ] - verifiedSpeed
        ) > 400 ||
            Math.abs(
                jsonData[rowIndex + offset]?.[
                    type === 'Booster' ? 'booster_speed' : 'ship_speed'
                ] - verifiedSpeed
            ) > 400 ||
            verifiedSpeed === 0) &&
        rowIndex - offset >= 0 &&
        rowIndex + offset < jsonData.length
    ) {
        const previousSpeed =
            jsonData[rowIndex - offset]?.[
                type === 'Booster' ? 'booster_speed' : 'ship_speed'
            ];
        const nextSpeed =
            jsonData[rowIndex + offset]?.[
                type === 'Booster' ? 'booster_speed' : 'ship_speed'
            ];

        if (
            previousSpeed !== undefined &&
            nextSpeed !== undefined &&
            previousSpeed !== 0 &&
            nextSpeed !== 0
        ) {
            verifiedSpeed = Math.round((previousSpeed + nextSpeed) / 2);
        }
        offset++;
    }
    return verifiedSpeed;
}

export async function VerifyAltitude(jsonData, rowIndex, type) {
    let verifiedAltitude =
        type === 'Booster'
            ? jsonData[rowIndex].booster_altitude
            : jsonData[rowIndex].ship_altitude;
    let offset = 1;

    while (
        (Math.abs(
            jsonData[rowIndex - offset]?.[
                type === 'Booster' ? 'booster_altitude' : 'ship_altitude'
            ] - verifiedAltitude
        ) > 3 ||
            Math.abs(
                jsonData[rowIndex + offset]?.[
                    type === 'Booster' ? 'booster_altitude' : 'ship_altitude'
                ] - verifiedAltitude
            ) > 3 ||
            verifiedAltitude === 0) &&
        rowIndex - offset >= 0 &&
        rowIndex + offset < jsonData.length
    ) {
        const previousAltitude =
            jsonData[rowIndex - offset]?.[
                type === 'Booster' ? 'booster_altitude' : 'ship_altitude'
            ];
        const nextAltitude =
            jsonData[rowIndex + offset]?.[
                type === 'Booster' ? 'booster_altitude' : 'ship_altitude'
            ];

        if (
            previousAltitude !== undefined &&
            nextAltitude !== undefined &&
            previousAltitude !== 0 &&
            nextAltitude !== 0
        ) {
            verifiedAltitude = Math.round(
                (previousAltitude + nextAltitude) / 2
            );
        }
        offset++;
    }
    return verifiedAltitude;
}
export async function VerifyFuel(jsonData, rowIndex, type) {
    const fuel_type =
        {
            B_lox: 'booster_LOX_Percent',
            B_CH4: 'booster_CH4_Percent',
            S_LOX: 'ship_LOX_Percent',
            S_CH4: 'ship_CH4_Percent'
        }[type] || 'ship_CH4_Percent';

    let verifyFuel = jsonData[rowIndex][fuel_type];
    let offset = 1;

    while (
        (Math.abs(jsonData[rowIndex - offset]?.[fuel_type] - verifyFuel) > 5 ||
            Math.abs(jsonData[rowIndex + offset]?.[fuel_type] - verifyFuel) >
                5 ||
            verifyFuel === 0) &&
        rowIndex - offset >= 0 &&
        rowIndex + offset < jsonData.length
    ) {
        const previousFuelPercentage = jsonData[rowIndex - offset]?.[fuel_type];
        const nextFuelPercentage = jsonData[rowIndex + offset]?.[fuel_type];

        if (
            previousFuelPercentage !== undefined &&
            nextFuelPercentage !== undefined
        ) {
            verifyFuel = Math.round(
                (previousFuelPercentage + nextFuelPercentage) / 2
            );
        }
        offset++;
    }
    return verifyFuel;
}

export async function VerifyTilt(jsonData, rowIndex, type) {
    const fuel_type = type == 'B' ? 'booster_tilt' : 'ship_Tilt';

    let verifyTilt = jsonData[rowIndex][fuel_type];
    let offset = 1;

    while (
        (Math.abs(jsonData[rowIndex - offset]?.[fuel_type] - verifyTilt) > 45 ||
            Math.abs(jsonData[rowIndex + offset]?.[fuel_type] - verifyTilt) >
                45 ||
            verifyTilt === 0) &&
        rowIndex - offset >= 0 &&
        rowIndex + offset < jsonData.length
    ) {
        const previousTilt = jsonData[rowIndex - offset]?.[fuel_type];
        const nextTilt = jsonData[rowIndex + offset]?.[fuel_type];

        if (previousTilt !== undefined && nextTilt !== undefined) {
            verifyTilt = Math.round((previousTilt + nextTilt) / 2);
        }
        offset++;
    }
    return verifyTilt;
}

export async function saveJsonToFile(jsonData, filePath) {
    try {
        const jsonString = JSON.stringify(jsonData, null, 4);
        fs.writeFileSync(filePath, jsonString, 'utf8');
    } catch (error) {
        console.error('❌ Error writing JSON file:', error);
    }
}
