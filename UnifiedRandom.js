const crypto = require('crypto');

/*
    UnifiedRandom version 1.01
    by Michal Obara (mobaradev) mobaradev@yahoo.com http://mobaradev.com
    MIT License
*/

class UnifiedRandom {
    seed = "";
    index = 0;
    _signValues = {
        '0': (1/16)/2,
        '1': (1/16 + 2/16)/2,
        '2': (2/16 + 3/16)/2,
        '3': (3/16 + 4/16)/2,
        '4': (4/16 + 5/16)/2,
        '5': (5/16 + 6/16)/2,
        '6': (6/16 + 7/16)/2,
        '7': (7/16 + 8/16)/2,
        '8': (8/16 + 9/16)/2,
        '9': (9/16 + 10/16)/2,
        'a': (10/16 + 11/16)/2,
        'b': (11/16 + 12/16)/2,
        'c': (12/16 + 13/16)/2,
        'd': (13/16 + 14/16)/2,
        'e': (14/16 + 15/16)/2,
        'f': (15/16 + 16/16)/2
    };

    constructor(seed) {
        if (!seed || seed === "") seed = Date.now().toString();
        this.seed = seed;
    }

    getValue() {
        const toHash = this.seed + "-" + this.index;
        const hash = crypto.createHash('sha256').update(toHash).digest('hex');

        let value = 0;

        for (let i = 0; i < 8; i++) {
            let sign = hash[i];
            let signValue = this._signValues[sign];

            if (i === 0) {
                value = signValue;
            } else {
                let delta = 1;
                for (let j = 0; j < i; j++) delta = delta/16;

                if (this._signValues[hash[15 - i]] < 0.5) {
                    value -= signValue * delta;
                } else {
                    value += signValue * delta;
                }
                if (value < 0) value = 0;
                else if (value > 1) value = 1;
            }
        }

        this.index++;
        return value;
    }

    getNumber(min, max) {
        // verify and, if possible fix types of min and max arguments
        if (typeof(min) !== 'number' || typeof(max) !== 'number') return console.error('UnifiedRandom error: wrong type of getNumber(min, max) argument(s). They have to be numbers.');
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
            min = parseInt(min);
            max = parseInt(max);
            console.warn("UnifiedRandom warning: arguments of getNumber(min, max) are supposed to be integers. Parsed automatically.");
        }

        const value = this.getValue();
        const intervals = max - min + 1;

        return Math.floor(intervals * value) + min;
    }
}

module.exports = UnifiedRandom;
