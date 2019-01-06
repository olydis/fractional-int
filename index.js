"use strict";
var INT_CACHE_STEP = 1;
var INT_STEP = 1 / 512;
// const INT_STEP = 1 / 512 / 16;
// const DER_STEP = 1 / 1024 / 512;
var DER_STEP = 1 / 1024 / 16;
function getCoeffs(pow, prec) {
    if (pow === void 0) { pow = 1; }
    if (prec === void 0) { prec = pow; }
    var binom = 1;
    var coeffs = [];
    for (var k = 0, s = 1; k <= prec; ++k, s = -s) {
        coeffs.push(s * binom);
        binom *= pow - k;
        binom /= k + 1;
    }
    return coeffs;
}
function derivate(f, pow, a) {
    if (pow === void 0) { pow = 1; }
    if (a === void 0) { a = 0; }
    var stepSize = Math.pow(2, -10);
    var prec = 10000;
    var coeffs = getCoeffs(pow, pow + prec);
    var offset = pow / 2; // other values cause visible shift in higher e^x derivatives
    var step = stepSize;
    var scale = Math.pow(step, 1 / pow);
    if (pow < 1) {
        scale = stepSize;
        step = Math.pow(scale, pow);
    }
    // if (pow != (pow | 0))
    //     console.log(pow, coeffs.reduce((a, b) => a + b, 0), coeffs.filter(x => x > 0).reduce((a, b) => a + b, 0), coeffs.filter(x => x < 0).reduce((a, b) => a + b, 0));
    return function (x) {
        var sum = 0;
        for (var k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (offset - k) * scale);
        return sum / step;
    };
}
