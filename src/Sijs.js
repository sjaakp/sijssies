
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

import Bird from './Bird';

export default function Sijs(position, course, settings)
{
    Bird.call(this, position, course, settings, settings.sijs);
    this.settings = settings;
}

Sijs.prototype = Object.create(Bird.prototype);
Object.defineProperty(Sijs.prototype, 'constructor', {
    value: Sijs,
    enumerable: false,
    writable: true
});

Sijs.prototype.hilight = function (neighbours, on) {
    this.uniforms.u_color = on ? this.settings.hilightColor : this.settings.sijs.color;
    let col = on ? this.settings.neighbourColor : this.settings.sijs.color;
    neighbours.forEach(v => {
        v[0].uniforms.u_color = col;
    });
    return this;
};
