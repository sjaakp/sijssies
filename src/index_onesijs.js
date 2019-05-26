/* main js-file. Build with rollup -c */
/*jshint esversion: 6,  strict: false*/

// @link https://github.com/greggman/twgl.js
// @link https://github.com/csbrandt/kd-tree-javascript

import twgl from 'twgl.js/dist/4.x/twgl-full';

import * as mat3 from 'gl-matrix/esm/mat3';
import * as mat4 from 'gl-matrix/esm/mat4';
import * as vec3 from 'gl-matrix/esm/vec3';
import * as quat from 'gl-matrix/esm/quat';

import Axes from './Axes';
import Controldesk from './Controldesk';
import Newsdesk from './Newsdesk';

import calcDelta from './calcDelta';

import cubeBI from './cubeBI';
import sijsBI from './sijsBI';

function App(gl)
{
    const app = this;

    const program_a = twgl.createProgramInfo(gl, ['vs-a', 'fs-a']);
    const program_u = twgl.createProgramInfo(gl, ['vs-u', 'fs-u']);

    const axes = new Axes(gl, program_a, settings.axesScale);

    twgl.setDefaults({attribPrefix: "a_"});

    const cubeBufferInfo = cubeBI(gl);
    const sijsBufferInfo = sijsBI(gl);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, settings.zoom, aspect, 1, null);

    function render(time) {
        let delta = calcDelta(time, indicators);

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let viewMatrix = mat4.create();

        let eye = vec3.fromValues(0, controls.cam_height, 800);
        vec3.rotateY(eye, eye, vec3.create(), controls.cam_angle);

        mat4.lookAt(viewMatrix, eye, vec3.fromValues(0, 60, 0), vec3.fromValues(0, 1, 0));

//    twgl.m4.inverse(twgl.m4.lookAt(eye, [0, 360, 0], [0, 1, 0]), viewMatrix );   // this is the same!

        let viewProjectionMatrix = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

        let qt = quat.create();
        quat.fromEuler(qt, controls.rot_x, controls.rot_y, controls.rot_z);

        let model = mat4.create();
        mat4.fromRotationTranslationScale(model,
            qt,
            [controls.x, controls.y, controls.z],
            [controls.scale_x, controls.scale_y, controls.scale_z]);

        let mvp = mat4.create();    // model-view-projection
        mat4.multiply(mvp, viewProjectionMatrix, model);

        let normal = mat3.create();
        mat3.normalFromMat4(normal, model);

        let prog = controls.cube ? program_a : program_u;
        let buf = controls.cube ? cubeBufferInfo : sijsBufferInfo;

        gl.useProgram(prog.program);
        twgl.setBuffersAndAttributes(gl, prog, buf);
        twgl.setUniforms(prog, {
            u_model: model,
            u_normal: normal,
            u_modelViewProjection: mvp,

            u_color: settings.sijsColor,
            u_reverseLightDirection: settings.revLightDir,
            u_ambientColor: settings.ambientColor,
        });

        gl.drawArrays(gl.TRIANGLES, 0, buf.numElements);

        if (controls.axes)  {
            axes.draw(gl, viewProjectionMatrix);
        }

        requestAnimationFrame(render);

        // console.log("Error code is " + gl.getError());
    }

    requestAnimationFrame(render);
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
    /*
        vision: 120,
        v_angle: 2.37,
        max_speed: 0.48,
        noise: 0.16,
        root_strength: 0.03,
        perching: 60,
        align: 0.11,
        cohesion: 0.005,
        separation: 0.2,
    */
    cam_angle: 0.52,
    cam_height: 500,
    axes: false,
    cube: true
    /*
        hilight: false,
        pov: false,
    */
});
const indicators = new Newsdesk([
    'fps',
    'version',
    /*
        'nboids',
        'neighbours'
    */
]);

function fly(id, options)
{
    const canvas = document.getElementById(id);
    const gl = twgl.getContext(canvas, { alpha: false });
    if (gl) {
        Object.assign(settings, {
            boidFace: [ 1, 0, 0 ],
            sijsColor: [0.55, 0.27, 0.07, 1],     // saddlebrown
            hilightColor: [0.5, 1, 0, 1],        // chartreuse
            neighbourColor: [0, 0.8, 0.82, 1],        // darkturqoise
            revLightDir: [0.5, 0.7, 1],
            ambientColor: [0.42, 0.42, 0.42],
            zoom: Math.PI / 4,
            backgroundColor: [1, 1, 1, 1],
            axesScale: 150

        }, options);
        vec3.normalize(settings.revLightDir, settings.revLightDir);
        indicators.version = gl.getParameter(gl.VERSION);

        let c = settings.backgroundColor;
        gl.clearColor(c[0], c[1], c[2], c[3]);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        return new this.App(gl);
    }
    else { canvas.innerText = 'Browser doesn\'t support WebGL'; return null; }
}

// import './index.scss';
export {App, fly};

