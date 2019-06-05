
/**
 * sjaakp/sijssies
 * ---------------
 *
 * Amsterdam variant of the famous 'boids' swarm-intelligence algorithm
 * Version 0.9.0
 * Copyright (c) 2019
 * Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/sijssies
 * https://sjaakpriester.nl
 */

export default function Averager(nValues)
{
    this.values = [];
    this.sum = 0;
    this.nValues = nValues;
}

Averager.prototype.avg = function(v)
{
    this.values.push(v);
    this.sum += v;
    if (this.values.length > this.nValues) {
        this.sum -= this.values.shift();
    }
    return this.sum / this.values.length;
};
