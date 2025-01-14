class Vehicles {
    constructor() {
        this.booster_speed = 0;
        this.booster_altitude = 0;
        this.ship_speed = 0;
        this.ship_altitude = 0;
        // this.boosterloxPercent = 100;
        // this.boosterch4Percent = 100;
        // this.shiploxPercent = 100;
        // this.shipch4Percent = 100;
    }

    starship(words, time, shipFuel, BoosterFuel) {
        const boosterfuel = BoosterFuel.split(' ');
        console.log(boosterfuel);
        // this.boosterloxPercent = boosterfuel[0];
        // this.boosterch4Percent = boosterfuel[1];

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
            // this.shiploxPercent = 100;
            // this.shipch4Percent = 100;
        } else {
            this.shiploxPercent = shipFuel.split()[0];
            this.shipch4Percent = shipFuel.split()[1];
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
            // ship_LOX_Percent: parseInt(this.shiploxPercent) || 0,
            // ship_CH4_Percent: parseInt(this.shipch4Percent) || 0,
            ...(totalSeconds <= 480 && {
                booster_speed: parseInt(this.booster_speed) || 0,
                booster_altitude: parseInt(this.booster_altitude) || 0
                // booster_LOX_Percent: parseInt(this.boosterloxPercent) || 0,
                // booster_CH4_Percent: parseInt(this.boosterch4Percent) || 0
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
