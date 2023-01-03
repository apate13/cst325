precision mediump float;

uniform sampler2D uTexture;// its specifies which texture unit we choose to handel texture
uniform float uAlpha;
varying vec2 v_Texcoords;
varying float animation;


void main(void) {
    gl_FragColor = texture2D(uTexture, v_Texcoords - animation);
    gl_FragColor.a = uAlpha; 
    //vec4(v_Texcoords.x, v_Texcoords.y, 0.0, uAlpha);
}

// EOF 00100001-10
