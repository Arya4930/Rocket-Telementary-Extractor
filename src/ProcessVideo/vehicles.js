class Vehicles {
    constructor() {
        this.booster_speed = 0;
        this.booster_altitude = 0;
        this.ship_speed = 0;
        this.ship_altitude = 0;
        this.boosterloxPercent = 100.0;
        this.boosterch4Percent = 100.0;
        this.shiploxPercent = 100.0;
        this.shipch4Percent = 100.0;
    }

    starship(words, time, shipFuel, BoosterFuel) {
        const boosterfuel = BoosterFuel.split('\r\n');
        console.log(boosterfuel);

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

        if (totalSeconds < 150) {
            this.ship_altitude = this.booster_altitude;
            this.ship_speed = this.booster_speed;
            this.boosterloxPercent = parseFloat(
                parseFloat(boosterfuel[0]).toFixed(2)
            );
            this.boosterch4Percent = parseFloat(
                parseFloat(boosterfuel[1]).toFixed(2)
            );
            this.shiploxPercent = 100.0;
            this.shipch4Percent = 100.0;
        } else {
            const ShipFuel = shipFuel.split('\r\n');
            console.log(shipFuel);
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
            ...(totalSeconds <= 480 && {
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
}

export default Vehicles;
