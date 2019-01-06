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

function derivate(f: RealFunction, pow: number = 1, a: number = 0): RealFunction {

    const stepSize = Math.pow(2, -10);
    const prec = 10000;

    const coeffs: number[] = getCoeffs(pow, pow + prec);
    const offset = pow / 2; // other values cause visible shift in higher e^x derivatives

    let step = stepSize;
    let scale = Math.pow(step, 1 / pow);
    if (pow < 1) {
        scale = stepSize;
        step = Math.pow(scale, pow);
    }

    // if (pow != (pow | 0))
    //     console.log(pow, coeffs.reduce((a, b) => a + b, 0), coeffs.filter(x => x > 0).reduce((a, b) => a + b, 0), coeffs.filter(x => x < 0).reduce((a, b) => a + b, 0));
    return x => {
        let sum = 0;
        for (let k = 0; k < coeffs.length; ++k)
            sum += coeffs[k] * f(x + (offset - k) * scale);
        return sum / step;
    };
}
