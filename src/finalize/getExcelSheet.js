import fs from 'fs';
import xl from 'excel4node';
import convert from 'convert-units';
import { fixjson } from './fixjson.js';

export default async function getExcelSheet(sheet, excelPath) {
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
    await fixjson(jsonData, sheet);
    jsonData.forEach(async (item, rowIndex) => {
        ws.cell(rowIndex + 2, 1).string(item.time || 'Not found');

        let booster_speed = parseFloat(item.booster_speed);
        let booster_acceleration = 0;
        let booster_altitude = parseFloat(item.booster_altitude);

        let ship_speed = parseFloat(item.ship_speed);
        let ship_acceleration = 0;
        let ship_altitude = parseFloat(item.ship_altitude);

        let booster_speedinms = Math.round((booster_speed / 3.6) * 100) / 100;
        let ship_speedinms = Math.round((ship_speed / 3.6) * 100) / 100;

        let previous_booster_speed = 0;
        let previous_ship_speed = 0;

        if (rowIndex > 0 && rowIndex + 1 < jsonData.length) {
            const previousBoosterSpeedinms =
                Math.round(
                    convert(previous_booster_speed).from('km/h').to('m/s') * 100
                ) / 100;
            const previousShipSpeedinms =
                Math.round(
                    convert(previous_ship_speed).from('km/h').to('m/s') * 100
                ) / 100;
            booster_acceleration = booster_speedinms - previousBoosterSpeedinms;
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
            item.booster_LOX_Percent === null || isNaN(item.booster_LOX_Percent)
                ? 0
                : item.booster_LOX_Percent
        );
        ws.cell(rowIndex + 2, 7).number(
            item.booster_CH4_Percent === null || isNaN(item.booster_CH4_Percent)
                ? 0
                : item.booster_CH4_Percent
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
            item.ship_LOX_Percent === null || isNaN(item.ship_LOX_Percent)
                ? 0
                : item.ship_LOX_Percent
        );
        ws.cell(rowIndex + 2, 13).number(
            item.ship_CH4_Percent === null || isNaN(item.ship_CH4_Percent)
                ? 0
                : item.ship_CH4_Percent
        );
    });

    wb.write(excelPath, (err) => {
        if (err) {
            console.error('Error writing Excel file:', err);
        } else {
            return console.log('Excel file created successfully!');
        }
    });
}
