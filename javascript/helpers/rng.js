(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    let useSeededRNG = false;
    let seededRNG = null;
    let rngCallCount = 0;

    if (seedParam) {
        console.log('Using seeded RNG with seed:', seedParam);
        useSeededRNG = true;
        let s = parseInt(seedParam);
        // Mulberry32
        seededRNG = function () {
            var t = s += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    window.randomBetween = function (min, max) {
        rngCallCount++;
        let val;
        if (useSeededRNG) {
            val = Math.floor(seededRNG() * (max - min + 1)) + min;
        } else {
            val = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // console.log(`RNG Call #${rngCallCount}: [${min}, ${max}] -> ${val}`);
        return val;
    };
})();
