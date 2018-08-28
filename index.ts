type RealFunction = (x: number) => number;

const INT_CACHE_STEP = 1;
const INT_STEP = 1 / 512;
// const INT_STEP = 1 / 512 / 16;
const DER_STEP = 1 / 1024 / 256;
// const DER_STEP = 1 / 8;

function ___integrate(f: RealFunction, min: number, max: number): number {
    let res = 0;
    for (; min + INT_STEP <= max; min += INT_STEP) res += INT_STEP * (f(min) + f(min + INT_STEP)) / 2;
    return res + (max - min) * (f(min) + f(max)) / 2;
}
// function __integrate(fPosDef: RealFunction): RealFunction {
//     const cache: number[] = [0];
//     return x => {
//         const lastCacheIndex = x / INT_CACHE_STEP | 0;
//         while (cache.length <= lastCacheIndex)
//             cache.push(cache[cache.length - 1] + ___integrate(fPosDef, INT_CACHE_STEP * (cache.length - 1), INT_CACHE_STEP * cache.length));
//         return cache[lastCacheIndex] + ___integrate(fPosDef, INT_CACHE_STEP * lastCacheIndex, x);
//     };
// }
// function _integrate(f: RealFunction, a: number): RealFunction {
//     const fPos = __integrate(x => f(a + x));
//     const fNeg = __integrate(x => f(a - x));
//     return x => { x -= a; return x >= 0 ? fPos(x) : -fNeg(-x) };
// }
// NOTE: due to its addition/subtraction with "a", the above is not guarantee that it only invokes f between a and x (inclusive)!
function _integrate(f: RealFunction, a: number): RealFunction {
    const cacheLeft: number[] = [0];
    const cacheRight: number[] = [0];
    return x => {
        const left = x < a;
        if (left) {
            let i = 0;
            let r = a;
            while (true) {
                const inext = i + 1;
                const rnext = r - INT_CACHE_STEP;
                if (rnext < x) break;
                if (inext == cacheLeft.length)
                    cacheLeft.push(cacheLeft[i] + ___integrate(f, rnext, r));
                i = inext;
                r = rnext;
            }
            return cacheLeft[i] + ___integrate(f, x, r);
        }
        else {
            let i = 0;
            let r = a;
            while (true) {
                const inext = i + 1;
                const rnext = r + INT_CACHE_STEP;
                if (rnext > x) break;
                if (inext == cacheRight.length)
                    cacheRight.push(cacheRight[i] + ___integrate(f, r, rnext));
                i = inext;
                r = rnext;
            }
            return cacheRight[i] + ___integrate(f, r, x);
        }
    };
}
function integrate(f: RealFunction, pow: number = 1, a: number = 0): RealFunction {
    if (pow < 0) {
        const k = Math.ceil(2 - pow);
        // return _derivate(integrate(f, k + pow, a), k);
        return x => _derivate(integrate(f, k + pow, x - 3), k)(x);
    }
    if (pow === 0) return f;
    if (pow < 1) {
        const k = Math.ceil(1 - pow);
        return _derivate(integrate(f, k + pow, a), k);
    }
    if (pow === 1) return _integrate(f, a);
    const denom = gamma(pow);
    pow--;
    return x => _integrate(t => f(t) * Math.pow(x - t, pow), a)(x) / denom;
}
function _derivate(f: RealFunction, pow: number): RealFunction {
    let binom = 1;
    const coeffs: number[] = [];
    let scale = Math.pow(DER_STEP, 1 / pow);
    for (let k = 0, s = pow % 2 == 0 ? 1 : -1; k < pow; ++k, s = -s) {
        coeffs.push(s * binom);
        binom *= pow - k;
        binom /= k + 1;
    }
    coeffs.push(1);
    const offset = pow / 2;
    return x => {
        let sum = 0;
        for (let k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (k - offset) * scale);
        return sum / DER_STEP;
    };
}
function derivate(f: RealFunction, pow: number = 1, a: number = 0): RealFunction {
    return integrate(f, -pow, a);
}
// experimental
function scan(f: RealFunction, coeffs: number[], pow: number): RealFunction {
    const coeffPower = coeffs.length - 1;
    const offset = pow / 2;
    const scale = Math.pow(DER_STEP, 1 / pow) * /*guess:*/pow / coeffPower;
    return x => {
        let sum = 0;
        for (let k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (k - offset) * scale);
        return sum / DER_STEP;
    };
}
function lincache(f: RealFunction, resolution: number): RealFunction {
    const cache: { [key: number]: number } = [];
    return x => {
        let t = x / resolution;
        const left = Math.floor(t);
        const right = Math.ceil(t);
        t -= left;
        cache[left] = cache[left] | f(left * resolution);
        cache[right] = cache[right] | f(right * resolution);
        return t * cache[right] + (1 - t) * cache[left];
    };
}

// from math.js
function gamma(n: number): number {
    const g = 4.7421875;
    const p = [
        0.99999999999999709182,
        57.156235665862923517,
        -59.597960355475491248,
        14.136097974741747174,
        -0.49191381609762019978,
        0.33994649984811888699e-4,
        0.46523628927048575665e-4,
        -0.98374475304879564677e-4,
        0.15808870322491248884e-3,
        -0.21026444172410488319e-3,
        0.21743961811521264320e-3,
        -0.16431810653676389022e-3,
        0.84418223983852743293e-4,
        -0.26190838401581408670e-4,
        0.36899182659531622704e-5
    ];
    let t, x;

    if (n == (n | 0)) {
        if (n <= 0) return isFinite(n) ? Infinity : NaN;
        if (n > 171) return Infinity;
        let res = 1;
        while (--n >= 2) res *= n;
        return res;
    }

    if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));

    if (n >= 171.35) return Infinity;

    if (n > 85.0) { // Extended Stirling Approx
        const twoN = n * n
        const threeN = twoN * n
        const fourN = threeN * n
        const fiveN = fourN * n
        return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
            (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) -
                571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) +
                5246819 / (75246796800 * fiveN * n))
    }

    --n;
    x = p[0];
    for (let i = 1; i < p.length; ++i)
        x += p[i] / (n + i);

    t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}
// function binom(a: number, b: number): number {
//     let res = 1;
//     if (b > a - b) b = a - b;
//     for (let i = 1; i <= b; ++i) {
//         res *= a - i + 1;
//         res /= i;
//     }
//     return res;
// }
// function factorial(npos: number): number {
//     let res = 1;
//     while (npos >= 2) res *= npos--;
//     return res;
// }

// test
// const c: RealFunction = x => 1;
// const ci: RealFunction = integrate(c);
// const ci2: RealFunction = integrate(c, 2);
// for (let i = 0; i < 10; i += 0.25) {
//     // console.log(i, ci(i), ci2(i));
// }

// const _1x4: RealFunction = x => x * x * x * x;
// const _4x3: RealFunction = x => 4 * x * x * x;
// const _12x2: RealFunction = x => 12 * x * x;
// const _24x1: RealFunction = x => 24 * x;
// const _24x0: RealFunction = x => 24;
// const __1x4: RealFunction = derivate(_1x4, 0);
// const __4x3: RealFunction = derivate(_1x4, 1);
// const __12x2: RealFunction = derivate(_1x4, 2);
// const __24x1: RealFunction = derivate(_1x4, 3);
// const __24x0: RealFunction = derivate(_1x4, 4);
// for (let i = 0; i < 10; i += 0.5) {
//     // console.log(i, _1x4(i), __1x4(i));
//     // console.log(i, _4x3(i), __4x3(i));
//     // console.log(i, _12x2(i), __12x2(i));
//     // console.log(i, _24x1(i), __24x1(i));
//     // console.log(i, _24x0(i), __24x0(i));
// }