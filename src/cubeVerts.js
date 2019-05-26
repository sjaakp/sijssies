
import twgl from 'twgl.js/dist/4.x/twgl-full';

export default function(gl)
{
    const cubeVerts = twgl.primitives.createCubeVertices(1);
    const cubeColors = twgl.primitives.makeRandomVertexColors(twgl.primitives.deindexVertices(cubeVerts), { vertsPerColor: 6 });
    return twgl.createBufferInfoFromArrays(gl, cubeColors);
}
