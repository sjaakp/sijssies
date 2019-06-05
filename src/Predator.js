
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

import * as vec3 from 'gl-matrix/esm/vec3';

import Bird from './Bird';

export default function Predator(settings)
{
    let course = vec3.create();
    vec3.random(course, 1);
    Bird.call(this, vec3.fromValues(2000, -2000, 0), course, settings, settings.predator);
}

Predator.prototype = Object.create(Bird.prototype);
Object.defineProperty(Predator.prototype, 'constructor', {
    value: Predator,
    enumerable: false,
    writable: true
});
