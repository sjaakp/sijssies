
import twgl from 'twgl.js/dist/4.x/twgl-full.js';
import mat4 from 'gl-matrix/cjs/mat4.js';

export default function Axes(gl, settings) {
    let scale = settings.axesScale;
    this.model = mat4.create();
    mat4.fromScaling(this.model, [scale, scale, scale]);
    this.projection = settings.projection;
}

Axes.prototype.draw = function (gl, viewMatrix) {
    let worldView = mat4.create();
    mat4.multiply(worldView, viewMatrix, this.model);

    const program_a = twgl.createProgramInfo(gl, ['vs-a', 'fs-a']);

    gl.useProgram(program_a.program);
    twgl.setUniforms(program_a, {
        u_worldView: worldView,
        u_projection: this.projection,
    });

    twgl.setBuffersAndAttributes(gl, program_a, twgl.createBufferInfoFromArrays(gl, this.axesVerts));
    gl.drawArrays(gl.LINES, 0, 6);

    // there must be an easier way to achieve this, I know...
    twgl.setBuffersAndAttributes(gl, program_a, twgl.createBufferInfoFromArrays(gl, this.axesDots));

    gl.drawArrays(gl.POINTS, 0, 3);
};

Axes.prototype.axesVerts = {
    position: [-1, 0, 0, 1, 0, 0,
        0, -1, 0, 0, 1, 0,
        0, 0, -1, 0, 0, 1],
    color: [0.860, 0.207, 0.270, 1, 0.860, 0.207, 0.270, 1, // #dc3545, red
        0.156, 0.652, 0.270, 1, 0.156, 0.652, 0.270, 1,     // #28a745, green
        0, 0.480, 1, 1, 0, 0.480, 1, 1]                     // #007bff, blue
};

Axes.prototype.axesDots = {
    position: [ 1, 0, 0,
        0, 1, 0,
        0, 0, 1],
    color: [0.860, 0.207, 0.270, 1,
        0.156, 0.652, 0.270, 1,
        0, 0.480, 1, 1]
};
