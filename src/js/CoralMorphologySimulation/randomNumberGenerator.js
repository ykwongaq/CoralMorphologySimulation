export default class RandomNumberGenerator {
    static DEFAULT_SEED = 584446;
    static seed = RandomNumberGenerator.DEFAULT_SEED;
    static m = 0x80000000;
    static a = 1103515245;
    static c = 12345;

    static setSeed(seed) {
        RandomNumberGenerator.seed = seed;
    }

    static getSeed() {
        return RandomNumberGenerator.seed;
    }

    static random() {
        return Math.random();
    }

    static seedRandom(min = 0, max = 1) {
        if (max < min) {
            throw new Error("max must be greater than min");
        }
        let newSeed =
            (RandomNumberGenerator.a * RandomNumberGenerator.seed +
                RandomNumberGenerator.c) %
            RandomNumberGenerator.m;
        RandomNumberGenerator.seed = newSeed;
        return min + ((max - min) * newSeed) / RandomNumberGenerator.m;
    }
}
