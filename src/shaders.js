
function shader(id, type, content)
{
    let element = document.createElement('script');
    element.setAttribute('id', id);
    element.setAttribute('type', type);
    element.innerHTML = content;
    document.head.appendChild(element);
}

export default function shaders()
{
    shader('vs-u', 'x-shader/x-vertex',
`attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_worldView;
uniform mat4 u_projection;
uniform vec4 u_color;

varying vec3 v_position;
varying vec3 v_normal;
varying vec4 v_color;

void main() {
  gl_Position = u_projection * u_worldView * a_position;

  v_normal = normalize(a_normal);
  v_color = u_color;
  v_position = (u_worldView * a_position).xyz;
}`);

    shader('fs-u', 'x-shader/x-fragment',
`#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

uniform vec3 u_reverseLightDirection;
uniform vec3 u_ambientColor;
uniform mat3 u_normal;
uniform vec4 u_fogColor;
// uniform float u_fogNear;
// uniform float u_fogFar;

varying vec3 v_position;
varying vec3 v_normal;
varying vec4 v_color;

void main() {
   // because v_normal is a varying it's interpolated
   // it will not be a uint vector. Normalizing it
   // will make it a unit vector again
   vec3 normal = normalize(u_normal * v_normal);

   float light = dot(normal, u_reverseLightDirection);
 
   float fogDistance = length(v_position);
   float fogAmount = smoothstep(2000.0, 6000.0, fogDistance);

   gl_FragColor = mix(v_color, u_fogColor, fogAmount);  

   // Multiply just the color portion (not the alpha)
   // by the light
   gl_FragColor.rgb *= light;
   gl_FragColor.rgb += u_ambientColor;
}`);



    shader('vs-a', 'x-shader/x-vertex',
`attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_worldView;
uniform mat4 u_projection;

varying vec4 v_color;

void main() {
  gl_PointSize = 4.0;
  gl_Position = u_projection * u_worldView * a_position;
  v_color = a_color;
}`);

   shader('fs-a', 'x-shader/x-fragment',
`#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

varying vec4 v_color;

void main() {
   gl_FragColor = v_color;
}`);
}
