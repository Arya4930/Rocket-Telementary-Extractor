import fs from 'fs';
import xl from 'excel4node';

const VerifySpeed = (jsonData, rowIndex, type) => {
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

        if (previousSpeed !== undefined && nextSpeed !== undefined) {
            verifiedSpeed = Math.round((previousSpeed + nextSpeed) / 2);
        }
        offset++;
    }
    return verifiedSpeed;
};

const VerifyAltitude = (jsonData, rowIndex, type) => {
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

        if (previousAltitude !== undefined && nextAltitude !== undefined) {
            verifiedAltitude = Math.round(
                (previousAltitude + nextAltitude) / 2
            );
        }
        offset++;
    }
    return verifiedAltitude;
};
const VerifyFuel = (jsonData, rowIndex, type) => {
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
};

export default function getExcelSheet(sheet) {
    const jsonData = JSON.parse(fs.readFileSync(sheet, 'utf8'));

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Telemetry Data');
    const headerStyle = wb.createStyle({
        font: {
            bold: true,
            size: 12
        }
    });
    const headers = [
        'Time( T )',
        'Booster_Speed ( Km/Hr )',
        'Booster_Speed ( m/s )',
        'Booster_Acceleration ( m/s^2 )',
        'Booster_Altitude ( KM )',
        'Booster_LOX_Percent',
        'Booster_CH4_Percent',
        'Ship_Speed ( Km/Hr )',
        'Ship_speed( m/s )',
        'Ship_Acceleration ( m/s^2 )',
        'Ship_Altitude ( KM )',
        'Ship_LOX_Percent',
        'Ship_CH4_Percent'
    ];
    headers.forEach((header, index) => {
        ws.cell(1, index + 1)
            .string(header)
            .style(headerStyle);
        ws.column(index + 1).setWidth(header.length);
    });
    jsonData.forEach(async (item, rowIndex) => {
        ws.cell(rowIndex + 2, 1).string(item.time || 'Not found');

        let booster_speed = parseFloat(item.booster_speed);
        let booster_acceleration = 0;
        let booster_altitude = parseFloat(item.booster_altitude);

        let ship_speed = parseFloat(item.ship_speed);
        let ship_acceleration = 0;
        let ship_altitude = parseFloat(item.ship_altitude);

        let Booster_LOX_Percent = parseFloat(item.booster_LOX_Percent);
        let Booster_CH4_Percent = parseFloat(item.booster_CH4_Percent);
        let Ship_LOX_Percent = parseFloat(item.ship_LOX_Percent);
        let Ship_CH4_Percent = parseFloat(item.ship_CH4_Percent);

        let booster_speedinms = Math.round((booster_speed / 3.6) * 100) / 100;
        let ship_speedinms = Math.round((ship_speed / 3.6) * 100) / 100;

        if (rowIndex > 0 && rowIndex + 1 < jsonData.length) {
            const previous_booster_speed = jsonData[rowIndex - 1].booster_speed;
            const previous_ship_speed = jsonData[rowIndex - 1].ship_speed;

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

            booster_speed = await jsonData[rowIndex].booster_speed;
            ship_speed = await jsonData[rowIndex].ship_speed;
            booster_altitude = await jsonData[rowIndex].booster_altitude;
            ship_altitude = await jsonData[rowIndex].ship_altitude;
            Booster_CH4_Percent = await jsonData[rowIndex].booster_CH4_Percent;
            Booster_LOX_Percent = await jsonData[rowIndex].booster_LOX_Percent;
            Ship_CH4_Percent = await jsonData[rowIndex].ship_CH4_Percent;
            Ship_LOX_Percent = await jsonData[rowIndex].ship_LOX_Percent;

            booster_speedinms = Math.round((booster_speed / 3.6) * 100) / 100;
            ship_speedinms = Math.round((ship_speed / 3.6) * 100) / 100;

            const previousBoosterSpeedinms =
                Math.round((previous_booster_speed / 3.6) * 100) / 100;
            booster_acceleration = booster_speedinms - previousBoosterSpeedinms;

            const previousShipSpeedinms =
                Math.round((previous_ship_speed / 3.6) * 100) / 100;
            ship_acceleration = ship_speedinms - previousShipSpeedinms;
        }

        ws.cell(rowIndex + 2, 2).number(
            booster_speed === null || isNaN(booster_speed) ? 0 : booster_speed
        );
        ws.cell(rowIndex + 2, 3).number(
            booster_speedinms === null || isNaN(booster_speedinms)
                ? 0
                : booster_speedinms
        );
        ws.cell(rowIndex + 2, 4).number(
            booster_acceleration === null || isNaN(booster_acceleration)
                ? 0
                : booster_acceleration
        );
        ws.cell(rowIndex + 2, 5).number(
            booster_altitude === null || isNaN(booster_altitude)
                ? 0
                : booster_altitude
        );
        ws.cell(rowIndex + 2, 6).number(
            Booster_LOX_Percent === null || isNaN(Booster_LOX_Percent)
                ? 0
                : Booster_LOX_Percent
        );
        ws.cell(rowIndex + 2, 7).number(
            Booster_CH4_Percent === null || isNaN(Booster_CH4_Percent)
                ? 0
                : Booster_CH4_Percent
        );
        ws.cell(rowIndex + 2, 8).number(
            ship_speed === null || isNaN(ship_speed) ? 0 : ship_speed
        );
        ws.cell(rowIndex + 2, 9).number(
            ship_speedinms === null || isNaN(ship_speedinms)
                ? 0
                : ship_speedinms
        );
        ws.cell(rowIndex + 2, 10).number(
            ship_acceleration === null || isNaN(ship_acceleration)
                ? 0
                : ship_acceleration
        );
        ws.cell(rowIndex + 2, 11).number(
            ship_altitude === null || isNaN(ship_altitude) ? 0 : ship_altitude
        );
        ws.cell(rowIndex + 2, 12).number(
            Ship_LOX_Percent === null || isNaN(Ship_LOX_Percent)
                ? 0
                : Ship_LOX_Percent
        );
        ws.cell(rowIndex + 2, 13).number(
            Ship_CH4_Percent === null || isNaN(Ship_CH4_Percent)
                ? 0
                : Ship_CH4_Percent
        );
    });

    wb.write('./results.xlsx', (err) => {
        if (err) {
            console.error('Error writing Excel file:', err);
        } else {
            console.log('Excel file created successfully!');
        }
    });
}
