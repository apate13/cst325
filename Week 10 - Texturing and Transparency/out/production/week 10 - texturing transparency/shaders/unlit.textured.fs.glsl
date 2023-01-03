precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;

// todo #3 - receive texture coordinates and verify correctness by 
// using them to set the pixel color 

void main(void) {
    // todo #5

    // todo #3
    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
}
