precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uAlpha;
uniform float uTime;

// #3 - receive texture coordinates and verify correctness by
// using them to set the pixel color
varying vec2 vTexcoords;

void main(void) {
    // #5
    vec4 tex1 = texture2D(uTexture, vTexcoords + uTime / 4.0);
    vec4 tex2 = texture2D(uTexture2, vTexcoords + uTime / 4.0);
    vec4 tex = (tex1 + tex2) / 2.0;
    // #3
    gl_FragColor = vec4(tex.xyz, uAlpha);
//    gl_FragColor = vec4(0.0, 0.0, 0.0, vColor);
}
