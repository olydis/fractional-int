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
