"use strict";
var INT_CACHE_STEP = 1;
var INT_STEP = 1 / 512;
// const INT_STEP = 1 / 512 / 16;
var DER_STEP = 1 / 1024 / 256;
// const DER_STEP = 1 / 8;
function ___integrate(f, min, max) {
    var res = 0;
    for (; min + INT_STEP <= max; min += INT_STEP)
        res += INT_STEP * (f(min) + f(min + INT_STEP)) / 2;
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
function _integrate(f, a) {
    var cacheLeft = [0];
    var cacheRight = [0];
    return function (x) {
        var left = x < a;
        if (left) {
            var i = 0;
            var r = a;
            while (true) {
                var inext = i + 1;
                var rnext = r - INT_CACHE_STEP;
                if (rnext < x)
                    break;
                if (inext == cacheLeft.length)
                    cacheLeft.push(cacheLeft[i] + ___integrate(f, rnext, r));
                i = inext;
                r = rnext;
            }
            return cacheLeft[i] + ___integrate(f, x, r);
        }
        else {
            var i = 0;
            var r = a;
            while (true) {
                var inext = i + 1;
                var rnext = r + INT_CACHE_STEP;
                if (rnext > x)
                    break;
                if (inext == cacheRight.length)
                    cacheRight.push(cacheRight[i] + ___integrate(f, r, rnext));
                i = inext;
                r = rnext;
            }
            return cacheRight[i] + ___integrate(f, r, x);
        }
    };
}
function integrate(f, pow, a) {
    if (pow === void 0) { pow = 1; }
    if (a === void 0) { a = 0; }
    if (pow < 0) {
        var k_1 = Math.ceil(2 - pow);
        // return _derivate(integrate(f, k + pow, a), k);
        return function (x) { return _derivate(integrate(f, k_1 + pow, x - 3), k_1)(x); };
    }
    if (pow === 0)
        return f;
    if (pow < 1) {
        var k = Math.ceil(1 - pow);
        return _derivate(integrate(f, k + pow, a), k);
    }
    if (pow === 1)
        return _integrate(f, a);
    var denom = gamma(pow);
    pow--;
    return function (x) { return _integrate(function (t) { return f(t) * Math.pow(x - t, pow); }, a)(x) / denom; };
}
function _derivate(f, pow) {
    var binom = 1;
    var coeffs = [];
    var scale = Math.pow(DER_STEP, 1 / pow);
    for (var k = 0, s = pow % 2 == 0 ? 1 : -1; k < pow; ++k, s = -s) {
        coeffs.push(s * binom);
        binom *= pow - k;
        binom /= k + 1;
    }
    coeffs.push(1);
    var offset = pow / 2;
    return function (x) {
        var sum = 0;
        for (var k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (k - offset) * scale);
        return sum / DER_STEP;
    };
}
function derivate(f, pow, a) {
    if (pow === void 0) { pow = 1; }
    if (a === void 0) { a = 0; }
    return integrate(f, -pow, a);
}
// experimental
function scan(f, coeffs, pow) {
    var coeffPower = coeffs.length - 1;
    var offset = pow / 2;
    var scale = Math.pow(DER_STEP, 1 / pow) * /*guess:*/ pow / coeffPower;
    return function (x) {
        var sum = 0;
        for (var k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (k - offset) * scale);
        return sum / DER_STEP;
    };
}
function lincache(f, resolution) {
    var cache = [];
    return function (x) {
        var t = x / resolution;
        var left = Math.floor(t);
        var right = Math.ceil(t);
        t -= left;
        cache[left] = cache[left] | f(left * resolution);
        cache[right] = cache[right] | f(right * resolution);
        return t * cache[right] + (1 - t) * cache[left];
    };
}
// from math.js
function gamma(n) {
    var g = 4.7421875;
    var p = [
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
    var t, x;
    if (n == (n | 0)) {
        if (n <= 0)
            return isFinite(n) ? Infinity : NaN;
        if (n > 171)
            return Infinity;
        var res = 1;
        while (--n >= 2)
            res *= n;
        return res;
    }
    if (n < 0.5)
        return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
    if (n >= 171.35)
        return Infinity;
    if (n > 85.0) { // Extended Stirling Approx
        var twoN = n * n;
        var threeN = twoN * n;
        var fourN = threeN * n;
        var fiveN = fourN * n;
        return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
            (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) -
                571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) +
                5246819 / (75246796800 * fiveN * n));
    }
    --n;
    x = p[0];
    for (var i = 1; i < p.length; ++i)
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
