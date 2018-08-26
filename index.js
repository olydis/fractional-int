"use strict";
var INT_CACHE_STEP = 1;
var INT_STEP = 1 / 1024;
var DER_STEP = 1 / 1024 / 128;
function __integrate(fPosDef, min, max) {
    var res = 0;
    for (; min + INT_STEP <= max; min += INT_STEP)
        res += INT_STEP * (fPosDef(min) + fPosDef(min + INT_STEP)) / 2;
    return res + (max - min) * (fPosDef(min) + fPosDef(max)) / 2;
}
function _integrate(fPosDef) {
    var cache = [0];
    return function (x) {
        var lastCacheIndex = x / INT_CACHE_STEP | 0;
        while (cache.length <= lastCacheIndex)
            cache.push(cache[cache.length - 1] + __integrate(fPosDef, INT_CACHE_STEP * (cache.length - 1), INT_CACHE_STEP * cache.length));
        return cache[lastCacheIndex] + __integrate(fPosDef, INT_CACHE_STEP * lastCacheIndex, x);
    };
}
function integrate(f, a) {
    if (a === void 0) { a = 0; }
    var fPos = _integrate(function (x) { return f(a + x); });
    var fNeg = _integrate(function (x) { return f(a - x); });
    return function (x) { x -= a; return x >= 0 ? fPos(x) : -fNeg(-x); };
}
function derivate(f, pow) {
    var binom = 1;
    var coeffs = [];
    var scale = Math.pow(DER_STEP, 1 / pow);
    for (var k = 0, s = pow % 2 == 0 ? 1 : -1; k < pow; ++k, s = -s) {
        coeffs.push(s * binom);
        binom *= pow - k;
        binom /= k + 1;
    }
    coeffs.push(1);
    console.log(coeffs);
    var offset = pow / 2;
    return function (x) {
        var sum = 0;
        for (var k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (k - offset) * scale);
        return sum / DER_STEP;
    };
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
var c = function (x) { return 1; };
var ci = integrate(c);
var ci2 = integrate(c, 2);
for (var i = 0; i < 10; i += 0.25) {
    // console.log(i, ci(i), ci2(i));
}
var _1x4 = function (x) { return x * x * x * x; };
var _4x3 = function (x) { return 4 * x * x * x; };
var _12x2 = function (x) { return 12 * x * x; };
var _24x1 = function (x) { return 24 * x; };
var _24x0 = function (x) { return 24; };
var __1x4 = derivate(_1x4, 0);
var __4x3 = derivate(_1x4, 1);
var __12x2 = derivate(_1x4, 2);
var __24x1 = derivate(_1x4, 3);
var __24x0 = derivate(_1x4, 4);
for (var i = 0; i < 10; i += 0.5) {
    // console.log(i, _1x4(i), __1x4(i));
    // console.log(i, _4x3(i), __4x3(i));
    // console.log(i, _12x2(i), __12x2(i));
    // console.log(i, _24x1(i), __24x1(i));
    console.log(i, _24x0(i), __24x0(i));
}
