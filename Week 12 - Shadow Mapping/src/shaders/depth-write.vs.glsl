
    attribute vec3 aVertexPosition;

    uniform mat4 uWorldMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying float vDepth;

    void main(void) {
        gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);

        // 2do #3 convert clip space depth into NDC and rescale from [-1, 1] to [0, 1]
        // temporarily set to gl_Position.z
        vDepth = gl_Position.z * 2.0 * 0.25 + 0.5;
    }