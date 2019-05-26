/* main js-file. Build with rollup -c */
/*jshint esversion: 6,  strict: false*/

// @link https://github.com/greggman/twgl.js

/*
    Very confusing:
      mat4.lookAt(...) corresponds to twgl.m4.inverse(twgl.m4.lookAt(...)).
      mat4.targetTo(...) corresponds to twgl.m4.lookAt(...).
*/

import twgl from 'twgl.js/dist/4.x/twgl-full';
import * as mat4 from 'gl-matrix/esm/mat4';
import * as vec3 from 'gl-matrix/esm/vec3';

import KdTree from './KdTree';

import Axes from './Axes';
import Controldesk from './Controldesk';
import Newsdesk from './Newsdesk';
import Sijs from './Sijs';
import Predator from './Predator';

import shaders from './shaders';
import calcDelta from './calcDelta';

import Triggers from './Triggers';

import sijsBI from './sijsVerts';

function App(gl)
{
    const zero = vec3.create(),
        up = vec3.fromValues(0, 1, 0);

    const triggers = new Triggers();

    const axes = new Axes(gl, /*program_a,*/ settings);

    const flock = [];
    let hilightSijs, hilightNeighbours;  // we may need them

    for (let i = 0; i < settings.initialN; i++) {   // fill flock with initialN sijssies...
        let position = vec3.create();
        let course = vec3.create();

        vec3.random(position, settings.limit / 3);  // ...having random position and course (3 is arbitrarely)
        vec3.random(course, controls.max_speed);

        let sijs = new Sijs(position, course, settings);
        if (i === 0) hilightSijs = sijs;

        flock.push(sijs);
    }

    let predator = new Predator(settings);

    // callback for kdTree
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);       // can't use vec3.distance here, because a or b may be an 'intermedium object', not a sijs
    let reportNeighbours = 0;

    requestAnimationFrame(render);
    // render loop
    function render(time) {
        let delta = calcDelta(time, indicators);
        indicators.nsijssies = flock.length;

        triggers.update(delta);
        if (triggers.remove)    {
            let sijs = flock.pop();    // undefined if empty
            if (sijs === hilightSijs && flock.length > 0)  { hilightSijs = flock[0]; }
        }
        if (triggers.add)   {
            let nest = vec3.fromValues(0, controls.cam_height, 2000);
            vec3.rotateY(nest, nest, zero, controls.cam_angle + Math.PI / 400);

            let sijs = new Sijs(nest, zero, settings);
            sijs.seek(zero, 0.1);
            if (flock.length === 0) hilightSijs = sijs;
            flock.push(sijs);
        }

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let worldView = mat4.create();

        if (controls.pov && flock.length > 0)   {   // point of view

                let eye = vec3.clone(hilightSijs.position);    // first sijssie is as good as any other
                mat4.lookAt(worldView, eye, hilightSijs.course, up );

        } else {
            let eye = vec3.fromValues(0, controls.cam_height, controls.cam_dist);
            vec3.rotateY(eye, eye, vec3.create(), Math.PI * controls.cam_angle / 180);

            mat4.lookAt(worldView, eye, vec3.fromValues(0, 60, 0), up);
        }

        let tree = new KdTree(flock, distance, ['x', 'y', 'z']);    // put flock in kdTree

        let totalNeighbours = 0;
        let freeze = controls.freeze;
        let gravityPoint = vec3.create();

        flock.forEach(function (sijs, index) {
            vec3.add(gravityPoint, gravityPoint, sijs.position);

            let nearest = tree.nearest(sijs, settings.nodeSearch, controls.vision);  // nearest returns Array of [ <sijs>, <distance> ] and includes <sijs> itself
            let neighbours = nearest.filter(v => {  // filter those which sijs can see, and exclude sijs itself
                return sijs.sees(v[0], Math.PI * controls.v_angle / 360);
            });
            totalNeighbours += neighbours.length;

            if (sijs === hilightSijs) hilightNeighbours = neighbours;    // remember

            if (! freeze)   {   // calculate new course
                if (neighbours.length > 0) {
                    sijs.separate(neighbours, controls.separation)  // crux of the swarm intelligence
                        .align(neighbours, controls.align)
                        .cohese(neighbours, controls.cohesion);
                }

                sijs
                //     .perch(controls.perching)
                    .root(controls.root_strength)   // don't fly of the screen
                    .noise(controls.noise)
                    .bounds(controls.max_accel, controls.max_speed);

                if (sijs.sees(predator, controls.v_angle))    {
                    sijs.flee(predator.position, 0.005);
                }
            }
        });

        vec3.scale(gravityPoint, gravityPoint, 1 / flock.length);

        reportNeighbours += delta;
        if (reportNeighbours > 500) {
            reportNeighbours = 0;
            indicators.neighbours = flock.length > 0 ? (totalNeighbours / flock.length).toFixed(1) : 0;
        }

        if (! freeze) {
            predator.root(0.01) // seek(gravityPoint, 0.03)
                .noise(0.08)
                .bounds(1, 1)
                .update(delta);

            flock.forEach(function (sijs) {
                sijs.update(delta);     // calculate new position
            });
        }

        predator.project(worldView);
//            .fog(controls.fog_near, controls.fog_far);

        flock.forEach(function (sijs) {
            sijs.project(worldView);
//                .fog(controls.fog_near, controls.fog_far);
        });

        let hilight = controls.hilight;
        if (hilight) hilightSijs.hilight(hilightNeighbours, true);

        twgl.drawObjectList(gl, [predator]);
        if (flock.length > 0) {
            twgl.drawObjectList(gl, flock);
        }

        if (hilight) hilightSijs.hilight(hilightNeighbours, false);

        if (controls.axes)  {
            axes.draw(gl, worldView);
        }

        requestAnimationFrame(render);

        // console.log("Error code is " + gl.getError());
    }

/*  // doesn't seem to work...
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            requestAnimationFrame(render);
        }
    });
*/

}

const settings = {};

const controls = new Controldesk({
    x: 0,
    y: 0,
    z: 0,
    rot_x: 0,
    rot_y: 0,
    rot_z: 0,
    scale_x: 0,
    scale_y: 0,
    scale_z: 0,
    vision: 200,
    v_angle: 120,
    max_accel: 0.48,
    max_speed: 0.48,
    noise: 0.16,
    root_strength: 0.03,
//        perching: 60,
    align: 0.11,
    cohesion: 0.005,
    separation: 0.2,

    cam_angle: 30,
    cam_dist: 1600,
    cam_height: 500,
/*
    fog_near: 1000,
    fog_far: 3000,
*/
    axes: false,
//    cube: true,
    hilight: false,
    freeze: false,
    pov: false,
});
const indicators = new Newsdesk([
    'fps',
    'version',
    'nsijssies',
    'neighbours'
]);

function fly(id, options)
{
    shaders();  // install WebGL shader programs

    const canvas = document.getElementById(id);
    const gl = twgl.getContext(canvas, { alpha: false });
    if (gl) {
        Object.assign(settings, {
            hilightColor: [0.5, 1, 0, 1],        // chartreuse
            neighbourColor: [0, 0.8, 0.82, 1],        // darkturqoise
            revLightDir: [0.5, 0.7, 1],
            ambientColor: [0.42, 0.42, 0.42],
            zoom: Math.PI / 4,
            backgroundColor: [1, 1, 1, 1],
            axesScale: 150,
            nodeSearch: 24,
            initialN: 100,
            sijs: {
                size: 24,
                face: [ 1, 0, 0 ],
                limit: 1000,
                color: [0.55, 0.27, 0.07, 1]     // saddlebrown 
            },
            predator: {
                size: 48,
                face: [ 1, 0, 0 ],
                limit: 2000,
                color: [1, 0, 0, 1]     // red 
            }
        }, options);

        twgl.setDefaults({attribPrefix: "a_"});

        vec3.normalize(settings.revLightDir, settings.revLightDir);
        
        settings.sijs.scale = vec3.fromValues(settings.sijs.size, 0.3 * settings.sijs.size, 0.6 * settings.sijs.size);
        settings.predator.scale = vec3.fromValues(settings.predator.size, 0.3 * settings.predator.size, 0.6 * settings.predator.size);
        settings.sijs.limit2 = settings.sijs.limit * settings.sijs.limit;
        settings.predator.limit2 = settings.predator.limit * settings.predator.limit;
        settings.sijs.verts = sijsBI(gl);
        settings.predator.verts = sijsBI(gl);

        settings.program = twgl.createProgramInfo(gl, ['vs-u', 'fs-u']);

        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, settings.zoom, aspect, settings.sijs.size, null);  // set 'near' to sijs.size for pov
        settings.projection = projectionMatrix;

        indicators.version = gl.getParameter(gl.VERSION);

/*
        let c = settings.backgroundColor;
        gl.clearColor(c[0], c[1], c[2], c[3]);
*/
        gl.clearColor(...settings.backgroundColor);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        return new this.App(gl);
    }
    else { canvas.innerText = 'Browser doesn\'t support WebGL'; return null; }
}

// import './index.scss';
export {App, fly};

