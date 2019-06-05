
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

import twgl from 'twgl.js/dist/4.x/twgl-full';

let _verts;

export default function(gl)
{
    if (! _verts)   {
        _verts = twgl.createBufferInfoFromArrays(gl, {
            position: [
                -1, 0, -1,
                0, -1, 0,
                0, 1, 0,

                -1, 0, 1,
                0, 1, 0,
                0, -1, 0,

                0, -1, 0,
                -1, 0, -1,
                1, 0, 0,

                -1, 0, 1,
                0, -1, 0,
                1, 0, 0,

                0, 1, 0,
                -1, 0, 1,
                1, 0, 0,

                -1, 0, -1,
                0, 1, 0,
                1, 0, 0
            ],
            normal: [
                -0.707, 0, 0.707,
                -0.707, 0, 0.707,
                -0.707, 0, 0.707,

                -0.707, 0, -0.707,
                -0.707, 0, -0.707,
                -0.707, 0, -0.707,

                0.408, -0.408, -0.816,
                0.408, -0.408, -0.816,
                0.408, -0.408, -0.816,

                0.408, -0.408, 0.816,
                0.408, -0.408, 0.816,
                0.408, -0.408, 0.816,

                0.408, 0.408, 0.816,
                0.408, 0.408, 0.816,
                0.408, 0.408, 0.816,

                0.408, 0.408, -0.816,
                0.408, 0.408, -0.816,
                0.408, 0.408, -0.816
            ]
        });
    }
    return _verts;
}

