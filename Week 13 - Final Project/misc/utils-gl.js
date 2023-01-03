// -------------------------------------------------------------------------
function createCompiledShader(gl, shaderText, shaderType) {
    var shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

// -----------------------------------------------------------------------------
function createCompiledAndLinkedShaderProgram(vertexShaderText, fragmentShaderText) {
    var vertexShader = createCompiledShader(gl, vertexShaderText, gl.VERTEX_SHADER);
    var fragmentShader = createCompiledShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return shaderProgram;
}

// -------------------------------------------------------------------------
function checkFrameBufferStatus() {
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.log('framebuffer incomplete: attachment');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.log('framebuffer incomplete: missing attachment');
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.log('framebuffer incomplete: dimensions');
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            console.log('framebuffer incomplete: unsupported');
            break;
    }
}