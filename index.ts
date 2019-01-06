type RealFunction = (x: number) => number;

const INT_CACHE_STEP = 1;
const INT_STEP = 1 / 512;
// const INT_STEP = 1 / 512 / 16;
// const DER_STEP = 1 / 1024 / 512;
const DER_STEP = 1 / 1024 / 16;

function getCoeffs(pow: number = 1, prec: number = pow): number[] {
    let binom = 1;
    const coeffs: number[] = [];
    for (let k = 0, s = 1; k <= prec; ++k, s = -s) {
        coeffs.push(s * binom);
        binom *= pow - k;
        binom /= k + 1;
    }
    return coeffs;
}
