
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

import * as mat3 from 'gl-matrix/esm/mat3';
import * as mat4 from 'gl-matrix/esm/mat4';
import * as vec3 from 'gl-matrix/esm/vec3';
import * as quat from 'gl-matrix/esm/quat';

export default function Bird(position, course, settings, birdSettings) {

    this.programInfo = settings.program;
    this.bufferInfo = birdSettings.verts;
    this.position = position;
    this.course = course;       // or: speed
    this.acceleration = vec3.create();
    this.uniforms = {
        u_normal: mat3.create(),
        u_worldView: mat4.create(),
        u_projection: settings.projection,
//        u_projection: mat4.create(),
//        u_modelViewProjection: mat4.create(),
        u_color: birdSettings.color,
        u_reverseLightDirection: settings.revLightDir,
        u_ambientColor: settings.ambientColor,
        u_fogColor: settings.backgroundColor
    };
    this.model = mat4.create();
    this.perching = 0;
    this.birdSettings = birdSettings;

}

// calculate u_model and u_normal from position and course
Bird.prototype.updateModel = function()
{
    let normCourse = vec3.create();
    vec3.normalize(normCourse, this.course);
    let q = quat.create();
    quat.rotationTo(q, this.birdSettings.face, normCourse);

    /*
            let right = vec3.create();
            vec3.cross(right, normCourse, up);

            let desiredUp = vec3.create();
            vec3.cross(desiredUp, right, normCourse);

            let newUp = vec3.create();
            vec3.transformQuat(newUp, up, q);

            let q2 = quat.create();
            quat.rotationTo(q2, newUp, desiredUp);

            quat.multiply(q, q2, q);
    */

    mat4.fromRotationTranslationScale(this.model,
        q,
        this.position,
        this.birdSettings.scale);
    mat3.normalFromMat4(this.uniforms.u_normal, this.model);
    return this;
};

// calculate new position from course, update u_model and u_normal
Bird.prototype.update = function(delta)
{
    if (! this.perching)    {
        let move = vec3.create();
        vec3.scale(move, this.course, delta);
        vec3.add(this.position, this.position, move);
        this.updateModel();
    }
    return this;
};

// calculate view-projection
Bird.prototype.project = function(viewProjection) {
    mat4.multiply(this.uniforms.u_worldView, viewProjection, this.model);
//    mat4.multiply(this.uniforms.u_modelViewProjection, viewProjection, this.model);
    return this;
};

/*
Bird.prototype.fog = function(near, far)
{
    this.uniforms.u_fogNear = near;
    this.uniforms.u_fogFar = far;
    return this;
};
*/

Bird.prototype.sees = function(other, visionAngle)
{
    if (this === other) return false;   // Bird can't see itself
    let d = vec3.create();
    vec3.subtract(d, other.position, this.position);
    let angle = vec3.angle(d, this.course);   // 0 ... PI, >= 0
    return angle <= visionAngle;
};

// seek, or steer to
Bird.prototype.seek = function (to, strength) {
    let diff = vec3.create();
    vec3.subtract(diff, to, this.position);
    vec3.normalize(diff, diff);
    vec3.scale(diff, diff, strength);
    vec3.add(this.acceleration, this.acceleration, diff);
    return this;
};

Bird.prototype.flee = function (from, strength) {
    let diff = vec3.create();
    vec3.subtract(diff, this.position, from);
    vec3.normalize(diff, diff);
    vec3.scale(diff, diff, strength);
    vec3.add(this.acceleration, this.acceleration, diff);
    return this;
};

Bird.prototype.perch = function(duration, level = 0)  {
    if (this.perching > 0)  {
        this.perching--;
    } else    {
        if (this.position[1] < level) {
            this.position[1] = level;
            this.perching = Math.floor(duration * Math.random());
            if (this.course[1] < 0) {
                this.course[1] = -this.course[1];
            }
        }
    }

    return this;
};

Bird.prototype.root = function (rootStrength) {
    if (!this.perching) {
        let dist2 = vec3.squaredLength(this.position);
        if (dist2 >= this.birdSettings.limit2) {
            let target = vec3.create();
            vec3.random(target, this.birdSettings.limit / 1.5);
            //               boidRandom(target, options.limit / 1.5);      // 1.5 is arbitrary
            this.seek(target, rootStrength);
        }
    }
    return this;
};

Bird.prototype.noise = function (level) {
    if (!this.perching) {
        if (level > 0 && Math.random() < level) {
            let rnd = vec3.create();
            vec3.random(rnd, level);
            vec3.add(this.acceleration, this.acceleration, rnd);
        }
    }
    return this;
};

Bird.prototype.boundVec = function(v, level)    {
    let curLevel = vec3.length(v);
    if (curLevel > level)   {
        vec3.scale(v, v, level / curLevel);
    }
    return v;
};

Bird.prototype.bounds = function (maxAccel, maxSpeed) {
    if (!this.perching) {
        this.acceleration = this.boundVec(this.acceleration, maxAccel);
        vec3.add(this.course, this.course, this.acceleration);
        this.course = this.boundVec(this.course, maxSpeed);
    }
    return this;
};

// avoid collisions with neighbours
Bird.prototype.separate = function (neighbours, strength = 1) {     // neighbours.length > 0
    let distance = 3 * this.birdSettings.size;
    let accu = vec3.create();
    neighbours.reduce((acc, v) => {
        let other = v[0], dist = v[1];
        if (dist < distance) {  // dist always > 0
            let diff = vec3.create();
            vec3.subtract(diff, this.position, other.position);
            vec3.scale(diff, diff, 1 / dist);   // weigh by distance
            return vec3.add(acc, acc, diff);
        }
        else return acc;
    }, accu);
    vec3.scale(accu, accu, strength / neighbours.length);
    vec3.add(this.acceleration, this.acceleration, accu);
    return this;
};

// let course approach average course of neighbours
Bird.prototype.align = function(neighbours, strength = 1) {     // neighbours.length > 0
    let accu = vec3.create();
    neighbours.reduce((acc, v) => {
        return vec3.add(acc, acc, v[0].course);
    }, accu);
    vec3.scale(accu, accu, strength / neighbours.length);
    vec3.add(this.acceleration, this.acceleration, accu);
    return this;
};

// steer to average position of neighbours
Bird.prototype.cohese = function(neighbours, strength) {     // neighbours.length > 0
    let accu = vec3.create();
    neighbours.reduce((acc, v) => {
        return vec3.add(acc, acc, v[0].position);
    }, accu);
    vec3.scale(accu, accu, 1 / neighbours.length);
    return this.seek(accu, strength);
};

Object.defineProperties(Bird.prototype, {
    x: {
        get() {
            return this.position[0];
        },
        enumerable: true
    },
    y: {
        get() {
            return this.position[1];
        },
        enumerable: true
    },
    z: {
        get() {
            return this.position[2];
        },
        enumerable: true
    },
}); // interface to kdTree
