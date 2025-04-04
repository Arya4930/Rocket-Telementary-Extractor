import convert from 'convert-units';
class Vehicles {
    constructor() {
        this.booster_speed = 0.0;
        this.booster_altitude = 0.0;
        this.ship_speed = 0.0;
        this.ship_altitude = 0.0;
        this.boosterloxPercent = 100.0;
        this.boosterch4Percent = 100.0;
        this.shiploxPercent = 97.0;
        this.shipch4Percent = 95.0;
        this.boosterTilt = 90.0;
        this.shipTilt = 90.0;
        this.boosterEngines = 0;
        this.shipEngines = 0;
    }

    starship(words, time, Fuel, Tilt, Engines, InCommingData) {
        const timeParts = time.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (!InCommingData) {
            if (words[0] !== 'SPEED') {
                words.shift();
            }
            this.booster_speed = parseInt(words[1]) || 0;
            for (let i = 0; i < words.length; i++) {
                if (words[i] === 'ALTITUDE' && words[i + 1]) {
                    this.booster_altitude = words[i + 1];
                    break;
                }
            }
            for (let i = 0; i < words.length; i++) {
                if (words[i] === 'ALTITUDE' && words[i + 1]) {
                    this.ship_altitude = words[i + 1];
                }
            }
            for (let i = 0; i < words.length; i++) {
                if (words[i] === 'SPEED' && words[i + 1]) {
                    this.ship_speed = words[i + 1];
                }
            }
        } else {
            this.booster_speed = words[0] ? words[0] : 0;
            this.booster_altitude = words[1] ? words[1] : 0;
            this.ship_speed = words[2] ? words[2] : 0;
            this.ship_altitude = words[3] ? words[3] : 0;
        }

        this.boosterloxPercent = parseFloat(
            parseFloat(Fuel[0]).toFixed(2) + 0.42
        );
        this.boosterch4Percent = parseFloat(
            parseFloat(Fuel[1]).toFixed(2) + 0.42
        );
        this.boosterTilt = parseFloat(Tilt[0]).toFixed(2);
        this.boosterEngines = Engines[0];

        if (totalSeconds <= 160) {
            this.ship_altitude = this.booster_altitude;
            this.ship_speed = this.booster_speed;
            this.shipTilt = this.boosterTilt;
            this.shiploxPercent = 97.0;
            this.shipch4Percent = 95.0;
        } else {
            if (words.length == 2) {
                this.ship_speed = words[0] ? words[0] : 0;
                this.ship_altitude = words[1] ? words[1] : 0;
            }
            if (totalSeconds > 420) {
                this.shipEngines = Engines[0];
                this.shiploxPercent = parseFloat(
                    parseFloat(Fuel[0]).toFixed(2) - 0.42
                );
                this.shipch4Percent = parseFloat(
                    parseFloat(Fuel[1]).toFixed(2) - 0.42
                );
                this.shipTilt = parseFloat(Tilt[0]).toFixed(2);
            } else {
                this.shipEngines = Engines[1];
                this.shiploxPercent = parseFloat(
                    parseFloat(Fuel[2]).toFixed(2) - 0.42
                );
                this.shipch4Percent = parseFloat(
                    parseFloat(Fuel[3]).toFixed(2) - 0.42
                );
                this.shipTilt = parseFloat(Tilt[1]).toFixed(2);
            }
        }

        const telemetryData = {
            time: time || 'Not found',
            ship_speed: parseInt(this.ship_speed) || 0,
            ship_altitude: parseInt(this.ship_altitude) || 0,
            ship_LOX_Percent: this.shiploxPercent,
            ship_CH4_Percent: this.shipch4Percent,
            ship_Tilt: parseFloat(this.shipTilt),
            ship_engines: parseInt(this.shipEngines),
            ...(totalSeconds <= 420 && {
                booster_speed: parseInt(this.booster_speed) || 0,
                booster_altitude: parseInt(this.booster_altitude) || 0,
                booster_LOX_Percent: this.boosterloxPercent,
                booster_CH4_Percent: this.boosterch4Percent,
                booster_tilt: parseFloat(this.boosterTilt),
                booster_engines: parseInt(this.boosterEngines)
            })
        };

        console.log(telemetryData);
        return telemetryData;
    }

    falcon9(words, time) {
        // code
    }

    // new_glenn(words, time) {
    //     const timeParts = time.split(':');
    //     const hours = parseInt(timeParts[0], 10);
    //     const minutes = parseInt(timeParts[1], 10);
    //     const seconds = parseInt(timeParts[2], 10);
    //     const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    //     for (let i = 0; i < words.length; i++) {
    //         if (
    //             words[i].boundingPolygon[0]['x'] > 237 &&
    //             words[i].boundingPolygon[0]['y'] > 977 &&
    //             words[i].boundingPolygon[1]['x'] < 400 &&
    //             words[i].boundingPolygon[1]['y'] < 1000
    //         ) {
    //             this.booster_speed =
    //                 Math.round(
    //                     convert(parseInt(words[i].text.replace(',', '')))
    //                         .from('mi')
    //                         .to('km') * 100
    //                 ) / 100;
    //         }
    //         if (
    //             words[i].boundingPolygon[0]['x'] > 560 &&
    //             words[i].boundingPolygon[0]['y'] > 980 &&
    //             words[i].boundingPolygon[1]['x'] < 720 &&
    //             words[i].boundingPolygon[1]['y'] < 1000
    //         ) {
    //             this.booster_altitude = parseInt(
    //                 words[i].text.replace(',', '')
    //             );
    //         }
    //     }

    //     if (totalSeconds <= 194) {
    //         this.ship_altitude = this.booster_altitude;
    //         this.ship_speed = this.booster_speed;
    //     } else {
    //         for (let i = 0; i < words.length; i++) {
    //             if (
    //                 words[i].boundingPolygon[0]['x'] > 1240 &&
    //                 words[i].boundingPolygon[0]['y'] > 980 &&
    //                 words[i].boundingPolygon[1]['x'] < 1400 &&
    //                 words[i].boundingPolygon[1]['y'] < 990
    //             ) {
    //                 this.ship_speed =
    //                     Math.round(
    //                         convert(parseInt(words[i].text.replace(',', '')))
    //                             .from('mi')
    //                             .to('km') * 100
    //                     ) / 100;
    //             }
    //             if (
    //                 words[i].boundingPolygon[0]['x'] > 1548 &&
    //                 words[i].boundingPolygon[0]['y'] > 980 &&
    //                 words[i].boundingPolygon[1]['x'] < 1710 &&
    //                 words[i].boundingPolygon[1]['y'] < 995
    //             ) {
    //                 this.ship_altitude = parseInt(
    //                     words[i].text.replace(',', '')
    //                 );
    //             }
    //         }
    //     }

    //     if (totalSeconds > 407) {
    //         this.booster_altitude =
    //             Math.round(
    //                 convert(this.booster_altitude).from('ft').to('km') * 100
    //             ) / 100;
    //         this.ship_altitude =
    //             Math.round(
    //                 convert(this.ship_altitude).from('mi').to('km') * 100
    //             ) / 100;
    //     } else if (totalSeconds > 218) {
    //         this.booster_altitude =
    //             Math.round(
    //                 convert(this.booster_altitude).from('mi').to('km') * 100
    //             ) / 100;
    //         this.ship_altitude =
    //             Math.round(
    //                 convert(this.ship_altitude).from('mi').to('km') * 100
    //             ) / 100;
    //     } else {
    //         this.booster_altitude =
    //             Math.round(
    //                 convert(this.booster_altitude).from('ft').to('km') * 100
    //             ) / 100;
    //         this.ship_altitude =
    //             Math.round(
    //                 convert(this.ship_altitude).from('ft').to('km') * 100
    //             ) / 100;
    //     }
    //     const telemetryData = {
    //         time: time || 'Not found',
    //         ship_speed: parseFloat(this.ship_speed) || 0,
    //         ship_altitude: parseFloat(this.ship_altitude) || 0,
    //         ...(totalSeconds <= 480 && {
    //             booster_speed: parseFloat(this.booster_speed) || 0,
    //             booster_altitude: parseFloat(this.booster_altitude) || 0
    //         })
    //     };

    //     console.log(telemetryData);
    //     return telemetryData;
    // }
}

export default Vehicles;
