precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 colOffset;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    colOffset = vec3(0.0, 0.0, 0.0);
}