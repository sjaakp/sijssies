
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
