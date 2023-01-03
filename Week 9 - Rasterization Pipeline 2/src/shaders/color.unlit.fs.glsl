precision highp float;

uniform vec4 uColor;
varying vec3 colOffset;

void main(void) {
    gl_FragColor = uColor + vec4(colOffset, 0.0);
}
