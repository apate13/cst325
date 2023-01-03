precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTexcoords;



uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float time;

varying vec2 v_Texcoords; 
varying float animation;


void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    v_Texcoords = aTexcoords;
    animation = time;
}

// EOF 00100001-10