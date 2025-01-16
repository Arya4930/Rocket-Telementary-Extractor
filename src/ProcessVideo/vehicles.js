class Vehicles {
    constructor() {
        this.booster_speed = 0.0;
        this.booster_altitude = 0.0;
        this.ship_speed = 0.0;
        this.ship_altitude = 0.0;
        this.boosterloxPercent = 100.0;
        this.boosterch4Percent = 100.0;
        this.shiploxPercent = 97.0;
        this.shipch4Percent = 94.0;
    }

    starship(words, time, shipFuel, BoosterFuel) {
        if (words[0].text !== 'SPEED') {
            words.shift();
        }
        this.booster_speed = parseInt(words[1].text) || 0;

        const timeParts = time.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        for (let i = 0; i < words.length; i++) {
            if (words[i].text === 'ALTITUDE' && words[i + 1]) {
                this.booster_altitude = words[i + 1].text;
                break;
            }
        }
        const boosterfuel = BoosterFuel.split('\r\n');
        this.boosterloxPercent = parseFloat(
            parseFloat(boosterfuel[0]).toFixed(2)
        );
        this.boosterch4Percent = parseFloat(
            parseFloat(boosterfuel[1]).toFixed(2)
        );

        if (totalSeconds < 150) {
            this.ship_altitude = this.booster_altitude;
            this.ship_speed = this.booster_speed;
            this.shiploxPercent = 97.0;
            this.shipch4Percent = 94.0;
        } else {
            const ShipFuel = shipFuel.split('\r\n');
            this.shiploxPercent = parseFloat(
                parseFloat(ShipFuel[0]).toFixed(2)
            );
            this.shipch4Percent = parseFloat(
                parseFloat(ShipFuel[1]).toFixed(2)
            );
            for (let i = 0; i < words.length; i++) {
                if (words[i].text === 'ALTITUDE' && words[i + 1]) {
                    this.ship_altitude = words[i + 1].text;
                }
            }
            for (let i = 0; i < words.length; i++) {
                if (words[i].text === 'SPEED' && words[i + 1]) {
                    this.ship_speed = words[i + 1].text;
                }
            }
        }

        const telemetryData = {
            time: time || 'Not found',
            ship_speed: parseInt(this.ship_speed) || 0,
            ship_altitude: parseInt(this.ship_altitude) || 0,
            ship_LOX_Percent: this.shiploxPercent,
            ship_CH4_Percent: this.shipch4Percent,
            ...(totalSeconds <= 420 && {
                booster_speed: parseInt(this.booster_speed) || 0,
                booster_altitude: parseInt(this.booster_altitude) || 0,
                booster_LOX_Percent: this.boosterloxPercent,
                booster_CH4_Percent: this.boosterch4Percent
            })
        };

        console.log(telemetryData);
        return telemetryData;
    }

    falcon9(words, time) {
        // code
    }

    new_glenn(words, time) {
        const timeParts = time.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        for (let i = 0; i < words.length; i++) {
            if (
                words[i].boundingPolygon[0]['x'] > 237 &&
                words[i].boundingPolygon[0]['y'] > 977 &&
                words[i].boundingPolygon[1]['x'] < 400 &&
                words[i].boundingPolygon[1]['y'] < 1000
            ) {
                this.booster_speed =
                    Math.round(
                        parseInt(words[i].text.replace(',', '')) * 1.60934 * 100
                    ) / 100;
            }
            if (
                words[i].boundingPolygon[0]['x'] > 560 &&
                words[i].boundingPolygon[0]['y'] > 980 &&
                words[i].boundingPolygon[1]['x'] < 720 &&
                words[i].boundingPolygon[1]['y'] < 1000
            ) {
                this.booster_altitude = parseInt(
                    words[i].text.replace(',', '')
                );
            }
        }

        if (totalSeconds <= 194) {
            this.ship_altitude = this.booster_altitude;
            this.ship_speed = this.booster_speed;
        } else {
            for (let i = 0; i < words.length; i++) {
                if (
                    words[i].boundingPolygon[0]['x'] > 1240 &&
                    words[i].boundingPolygon[0]['y'] > 980 &&
                    words[i].boundingPolygon[1]['x'] < 1400 &&
                    words[i].boundingPolygon[1]['y'] < 990
                ) {
                    this.ship_speed =
                        Math.round(
                            parseInt(words[i].text.replace(',', '')) *
                                1.60934 *
                                100
                        ) / 100;
                }
                if (
                    words[i].boundingPolygon[0]['x'] > 1548 &&
                    words[i].boundingPolygon[0]['y'] > 980 &&
                    words[i].boundingPolygon[1]['x'] < 1710 &&
                    words[i].boundingPolygon[1]['y'] < 995
                ) {
                    this.ship_altitude = parseInt(
                        words[i].text.replace(',', '')
                    );
                }
            }
        }

        if (totalSeconds > 407) {
            this.booster_altitude =
                Math.round(this.booster_altitude * 0.0003048 * 100) / 100;
            this.ship_altitude =
                Math.round(this.ship_altitude * 1.60934 * 100) / 100;
        } else if (totalSeconds > 218) {
            this.booster_altitude =
                Math.round(this.booster_altitude * 1.60934 * 100) / 100;
            this.ship_altitude =
                Math.round(this.ship_altitude * 1.60934 * 100) / 100;
        } else {
            this.booster_altitude =
                Math.round(this.booster_altitude * 0.0003048 * 100) / 100;
            this.ship_altitude =
                Math.round(this.ship_altitude * 0.0003048 * 100) / 100;
        }
        const telemetryData = {
            time: time || 'Not found',
            ship_speed: parseFloat(this.ship_speed) || 0,
            ship_altitude: parseFloat(this.ship_altitude) || 0,
            ...(totalSeconds <= 480 && {
                booster_speed: parseFloat(this.booster_speed) || 0,
                booster_altitude: parseFloat(this.booster_altitude) || 0
            })
        };

        console.log(telemetryData);
        return telemetryData;
    }
}

export default Vehicles;
