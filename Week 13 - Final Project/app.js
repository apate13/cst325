'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sunConfig, mercuryConfig, venusConfig, earthConfig, marsConfig, jupiterConfig, saturnConfig,
    neptuneConfig, uranusConfig, cloudsConfig, moonConfig, ringsConfig, sunHeatwave, cometConfig = null;
var particalOne, particalTwo, particalThree, particalFour, particalFive = null;
var spaceBack, spaceBottom, spaceTop, spaceLeft, spaceRight, spaceFront = null;

var planetPositions = new Vector3();
var mercuryPosition = new Vector3();
var venusPosition = new Vector3();
var earthPosition = new Vector3();
var marsPosition = new Vector3();
var jupiterPosition = new Vector3();
var saturnPosition = new Vector3();
var uranusPosition = new Vector3();
var neptunePosition = new Vector3();
var ringsPosition = new Vector3();
var cometPosition = new Vector3();
var ParticalPosition = new Vector3();

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();

var phongShaderProgram;
var basicColorProgram;
var textureShaderProgram;
window.onload = window['initializeAndStartRendering'];
var loadedAssets = {
    phongTextVS: null, phongTextFS: null, vertexColorVS: null, vertexColorFS: null, sphereJSON: null, sunImage: null, 
    mercuryImage: null, venusImage: null, earthImage: null, marsImage: null, jupiterImage: null, saturnImage: null, 
    neptuneImage: null, uranusImage: null, cloudImage: null, cometImage: null, textureTextVS: null, textureTextFS: null, 
    moonImage: null, spaceBackImage: null, spaceBottomImage: null, spaceFrontImage: null, spaceLeftImage: null, spaceRightImage: null,
    moonImage2: null, spaceBackImage: null, spaceBottomImage: null, spaceFrontImage: null, spaceLeftImage: null, spaceRightImage: null,
    spaceTopImage: null, ringsImage: null,

};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function () {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);

    } catch (e) { }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/sun.jpg'),
        loadImage('./data/mercury.jpg'),
        loadImage('./data/venus.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/mars.jpg'),
        loadImage('./data/jupiter.jpg'),
        loadImage('./data/saturn.jpg'),
        loadImage('./data/neptune.jpg'),
        loadImage('./data/uranus.jpg'),
        loadImage('./data/clouds.jpg'),
        loadImage('./data/comet.jpg'),
        fetch('./shaders/unlit.textured.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/unlit.textured.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/moon.jpg'),
        loadImage('./data/spaceBack.png'),
        loadImage('./data/spaceBottom.png'),
        loadImage('./data/spaceFront.png'),
        loadImage('./data/spaceLeft.png'),
        loadImage('./data/spaceRight.png'),
        loadImage('./data/spaceTop.png'),
        loadImage('./data/saturnsRing.png'),
        loadImage('./data/moon2.jpg')
    ];

    Promise.all(filePromises).then(function (values) {
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.sunImage = values[5];
        loadedAssets.mercuryImage = values[6];
        loadedAssets.venusImage = values[7];
        loadedAssets.earthImage = values[8];
        loadedAssets.marsImage = values[9];
        loadedAssets.jupiterImage = values[10];
        loadedAssets.saturnImage = values[11];
        loadedAssets.neptuneImage = values[12];
        loadedAssets.uranusImage = values[13];
        loadedAssets.cloudImage = values[14];
        loadedAssets.cometImage = values[15];
        loadedAssets.textureTextVS = values[16];
        loadedAssets.textureTextFS = values[17];
        loadedAssets.moonImage = values[18];
        loadedAssets.spaceBackImage = values[19];
        loadedAssets.spaceBottomImage = values[20];
        loadedAssets.spaceFrontImage = values[21];
        loadedAssets.spaceLeftImage = values[22];
        loadedAssets.spaceRightImage = values[23];
        loadedAssets.spaceTopImage = values[24];
        loadedAssets.ringsImage = values[25];
    }).catch(function (error) {
        console.error(error.message);
    }).finally(function () {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
        lightRotationUniform: gl.getUniformLocation(phongShaderProgram, "lightRotation"),

    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
        vertexTexcoordsAttribute: gl.getAttribLocation(basicColorProgram, "aTexcoords")
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(basicColorProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(basicColorProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(basicColorProgram, "uTexture"),
        lightRotationUniform: gl.getUniformLocation(basicColorProgram, "lightRotation"),
    };

    textureShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.textureTextVS, loadedAssets.textureTextFS);

    textureShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(textureShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(textureShaderProgram, "aTexcoords")
    };

    textureShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(textureShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(textureShaderProgram, "uAlpha"),

    };
}

// -------------------------------------------------------------------------
function createScene() {

    var ringsScale = new Matrix4().makeScale(0.075, 0.005, 0.075);
    var sunScale = new Matrix4().makeScale(0.25, 0.25, 0.25);
    var mercuryScale = new Matrix4().makeScale(0.015, 0.015, 0.015);
    var venusScale = new Matrix4().makeScale(0.03, 0.03, 0.03);
    var earthScale = new Matrix4().makeScale(0.033, 0.033, 0.033);
    var marsScale = new Matrix4().makeScale(0.017, 0.017, 0.017);
    var jupiterScale = new Matrix4().makeScale(0.07, 0.07, 0.07);
    var saturnScale = new Matrix4().makeScale(0.05, 0.05, 0.05);
    var neptuneScale = new Matrix4().makeScale(0.04, 0.04, 0.04);
    var uranusScale = new Matrix4().makeScale(0.04, 0.04, 0.04);
    var moonScale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var cloudScale = new Matrix4().makeScale(0.033335, 0.033335, 0.033335);
    var particalScale = new Matrix4().makeScale(0.08, 0.08, 0.08);
    var spaceScale = new Matrix4().makeScale(150.0, 150.0, 150.0);

    //Reference: stackoverflow.com for how to implement a sky box and how to arrange the textures
    var spaceTopRotation = new Matrix4().makeRotationX(-90);
    var spaceTopTranslation = new Matrix4().makeTranslation(0, 0, -1);

    var spaceBottomRotation = new Matrix4().makeRotationX(-90);
    var spaceBottomTranslation = new Matrix4().makeTranslation(0, 0, 1);

    var spaceBackRotation = new Matrix4().makeRotationX(0);
    var spaceBackTranslation = new Matrix4().makeTranslation(0, 0, -1);

    var spaceLeftRotation = new Matrix4().makeRotationY(90);
    var spaceLeftTranslation = new Matrix4().makeTranslation(0, 0, 1);

    var spaceRightRotation = new Matrix4().makeRotationY(90);
    var spaceRightTranslation = new Matrix4().makeTranslation(0, 0, -1);

    var spaceFrontRotation = new Matrix4().makeRotationX(0);
    var spaceFrontTranslation = new Matrix4().makeTranslation(0, 0, 1);

    var ringsRotation = new Matrix4().makeRotationX(0);

    var translation = new Matrix4().makeTranslation(0, 0, 0);

    moonConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    moonConfig.create(loadedAssets.sphereJSON, loadedAssets.moonImage);

    cometConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    cometConfig.create(loadedAssets.sphereJSON, loadedAssets.cometImage);

    particalOne = new WebGLGeometryQuad(gl, basicColorProgram);
    particalOne.create(loadedAssets.uranusImage);

    particalTwo = new WebGLGeometryQuad(gl, basicColorProgram);
    particalTwo.create(loadedAssets.neptuneImage);

    particalThree = new WebGLGeometryQuad(gl, basicColorProgram);
    particalThree.create(loadedAssets.uranusImage);

    particalFour = new WebGLGeometryQuad(gl, basicColorProgram);
    particalFour.create(loadedAssets.venusImage);

    particalFive = new WebGLGeometryQuad(gl, basicColorProgram);
    particalFive.create(loadedAssets.uranusImage);

    spaceTop = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceTop.create(loadedAssets.spaceTopImage);

    spaceBottom = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceBottom.create(loadedAssets.bottom);

    spaceBack = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceBack.create(loadedAssets.spaceBackImage);

    spaceLeft = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceLeft.create(loadedAssets.spaceLeftImage);

    spaceRight = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceRight.create(loadedAssets.spaceRightImage);

    spaceFront = new WebGLGeometryQuad(gl, basicColorProgram);
    spaceFront.create(loadedAssets.spaceFrontImage);

    sunConfig = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunConfig.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    sunHeatwave = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunHeatwave.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    mercuryConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    mercuryConfig.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);

    venusConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    venusConfig.create(loadedAssets.sphereJSON, loadedAssets.venusImage);

    earthConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    earthConfig.create(loadedAssets.sphereJSON, loadedAssets.earthImage);

    marsConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    marsConfig.create(loadedAssets.sphereJSON, loadedAssets.marsImage);

    jupiterConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    jupiterConfig.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    saturnConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    saturnConfig.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);

    neptuneConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    neptuneConfig.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);

    uranusConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    uranusConfig.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);

    cloudsConfig = new WebGLGeometryJSON(gl, phongShaderProgram);
    cloudsConfig.create(loadedAssets.sphereJSON, loadedAssets.cloudImage);

    ringsConfig = new WebGLGeometryJSON(gl, basicColorProgram);
    ringsConfig.create(loadedAssets.sphereJSON, loadedAssets.ringsImage);


    spaceTop.worldMatrix.makeIdentity();
    spaceTop.worldMatrix.multiply(spaceTopRotation).multiply(spaceScale).multiply(spaceTopTranslation);

    spaceBottom.worldMatrix.makeIdentity();
    spaceBottom.worldMatrix.multiply(spaceBottomRotation).multiply(spaceScale).multiply(spaceBottomTranslation);

    spaceBack.worldMatrix.makeIdentity();
    spaceBack.worldMatrix.multiply(spaceBackRotation).multiply(spaceScale).multiply(spaceBackTranslation);

    spaceLeft.worldMatrix.makeIdentity();
    spaceLeft.worldMatrix.multiply(spaceLeftRotation).multiply(spaceScale).multiply(spaceLeftTranslation);

    spaceRight.worldMatrix.makeIdentity();
    spaceRight.worldMatrix.multiply(spaceRightRotation).multiply(spaceScale).multiply(spaceRightTranslation);

    spaceFront.worldMatrix.makeIdentity();
    spaceFront.worldMatrix.multiply(spaceFrontRotation).multiply(spaceScale).multiply(spaceFrontTranslation);


    sunHeatwave.worldMatrix.makeIdentity();
    sunHeatwave.worldMatrix.multiply(translation).multiply(new Matrix4().makeScale(0.265, 0.265, 0.265));

    sunConfig.worldMatrix.makeIdentity();
    sunConfig.worldMatrix.multiply(translation).multiply(sunScale);

    mercuryConfig.worldMatrix.makeIdentity();
    mercuryConfig.worldMatrix.multiply(mercuryScale);

    venusConfig.worldMatrix.makeIdentity();
    venusConfig.worldMatrix.multiply(venusScale);

    earthConfig.worldMatrix.makeIdentity();
    earthConfig.worldMatrix.multiply(earthScale);

    marsConfig.worldMatrix.makeIdentity();
    marsConfig.worldMatrix.multiply(marsScale);

    jupiterConfig.worldMatrix.makeIdentity();
    jupiterConfig.worldMatrix.multiply(jupiterScale);

    saturnConfig.worldMatrix.makeIdentity();
    saturnConfig.worldMatrix.multiply(saturnScale);

    neptuneConfig.worldMatrix.makeIdentity();
    neptuneConfig.worldMatrix.multiply(neptuneScale);

    uranusConfig.worldMatrix.makeIdentity();
    uranusConfig.worldMatrix.multiply(uranusScale);

    cloudsConfig.worldMatrix.makeIdentity();
    cloudsConfig.worldMatrix.multiply(cloudScale);

    ringsConfig.worldMatrix.makeIdentity();
    ringsConfig.worldMatrix.multiply(ringsScale).multiply(ringsRotation);

    moonConfig.worldMatrix.makeIdentity();
    moonConfig.worldMatrix.multiply(moonScale);

    cometConfig.worldMatrix.makeIdentity();
    cometConfig.worldMatrix.multiply(moonScale);

    particalOne.worldMatrix.makeIdentity();
    particalOne.worldMatrix.multiply(particalScale);

    particalTwo.worldMatrix.makeIdentity();
    particalTwo.worldMatrix.multiply(particalScale);

    particalThree.worldMatrix.makeIdentity();
    particalThree.worldMatrix.multiply(particalScale);

    particalFour.worldMatrix.makeIdentity();
    particalFour.worldMatrix.multiply(particalScale);

    particalFive.worldMatrix.makeIdentity();
    particalFive.worldMatrix.multiply(particalScale);

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);


    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var uniforms = basicColorProgram.uniforms;

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);


    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);

    gl.useProgram(textureShaderProgram);
    gl.uniform1f(gl.getUniformLocation(textureShaderProgram, "time"), time.secondsElapsedSinceStart);

    var cosTime = Math.cos(time.secondsElapsedSinceStart);
    var sinTime = Math.sin(time.secondsElapsedSinceStart);


    var lightDistance = 4;
    lightPosition.x = cosTime * lightDistance;
    lightPosition.y = 1.5;
    lightPosition.z = sinTime * lightDistance;

    mercuryPosition.x = Math.cos(4 * time.secondsElapsedSinceStart);
    mercuryPosition.y = 1.5;
    mercuryPosition.z = Math.sin(4 * time.secondsElapsedSinceStart);

    venusPosition.x = Math.cos(1.6 * time.secondsElapsedSinceStart);
    venusPosition.y = 1.5;
    venusPosition.z = Math.sin(1.6 * time.secondsElapsedSinceStart);

    earthPosition.x = Math.cos(time.secondsElapsedSinceStart);
    earthPosition.y = 1.5;
    earthPosition.z = Math.sin(time.secondsElapsedSinceStart);

    marsPosition.x = Math.cos(0.5 * time.secondsElapsedSinceStart);
    marsPosition.y = 1.5;
    marsPosition.z = Math.sin(0.5 * time.secondsElapsedSinceStart);

    jupiterPosition.x = Math.cos(0.12 * time.secondsElapsedSinceStart);
    jupiterPosition.y = 1.5;
    jupiterPosition.z = Math.sin(0.12 * time.secondsElapsedSinceStart);

    saturnPosition.x = Math.cos(0.06 * time.secondsElapsedSinceStart);
    saturnPosition.y = 1.5;
    saturnPosition.z = Math.sin(0.06 * time.secondsElapsedSinceStart);

    neptunePosition.x = Math.cos(0.02 * time.secondsElapsedSinceStart);
    neptunePosition.y = 1.5;
    neptunePosition.z = Math.sin(0.02 * time.secondsElapsedSinceStart);

    uranusPosition.x = Math.cos(0.015 * time.secondsElapsedSinceStart);
    uranusPosition.y = 1.5;
    uranusPosition.z = Math.sin(0.015 * time.secondsElapsedSinceStart);

    cometPosition.x = Math.cos(time.secondsElapsedSinceStart);
    cometPosition.z = Math.sin(time.secondsElapsedSinceStart);

    mercuryConfig.worldMatrix.elements[3] = mercuryPosition.x * 20;
    mercuryConfig.worldMatrix.elements[7] = mercuryPosition.y;
    mercuryConfig.worldMatrix.elements[11] = mercuryPosition.z * 20;

    venusConfig.worldMatrix.elements[3] = venusPosition.x * 25;
    venusConfig.worldMatrix.elements[7] = venusPosition.y;
    venusConfig.worldMatrix.elements[11] = venusPosition.z * 25;

    earthConfig.worldMatrix.elements[3] = earthPosition.x * 34;
    earthConfig.worldMatrix.elements[7] = earthPosition.y;
    earthConfig.worldMatrix.elements[11] = earthPosition.z * 34;

    marsConfig.worldMatrix.elements[3] = marsPosition.x * 42;
    marsConfig.worldMatrix.elements[7] = marsPosition.y;
    marsConfig.worldMatrix.elements[11] = marsPosition.z * 42;

    jupiterConfig.worldMatrix.elements[3] = jupiterPosition.x * 49;
    jupiterConfig.worldMatrix.elements[7] = jupiterPosition.y;
    jupiterConfig.worldMatrix.elements[11] = jupiterPosition.z * 49;

    saturnConfig.worldMatrix.elements[3] = saturnPosition.x * 59;
    saturnConfig.worldMatrix.elements[7] = saturnPosition.y;
    saturnConfig.worldMatrix.elements[11] = saturnPosition.z * 59;

    neptuneConfig.worldMatrix.elements[3] = neptunePosition.x * 67;
    neptuneConfig.worldMatrix.elements[7] = neptunePosition.y;
    neptuneConfig.worldMatrix.elements[11] = neptunePosition.z * 67;

    uranusConfig.worldMatrix.elements[3] = uranusPosition.x * 74;
    uranusConfig.worldMatrix.elements[7] = uranusPosition.y;
    uranusConfig.worldMatrix.elements[11] = uranusPosition.z * 74;

    cloudsConfig.worldMatrix.elements[3] = earthPosition.x * 34;
    cloudsConfig.worldMatrix.elements[7] = earthPosition.y;
    cloudsConfig.worldMatrix.elements[11] = earthPosition.z * 34;

    ringsConfig.worldMatrix.elements[3] = saturnPosition.x * 59;
    ringsConfig.worldMatrix.elements[7] = saturnPosition.y;
    ringsConfig.worldMatrix.elements[11] = saturnPosition.z * 59;

    moonConfig.worldMatrix.elements[3] = earthPosition.x * 30;
    moonConfig.worldMatrix.elements[7] = earthPosition.y;
    moonConfig.worldMatrix.elements[11] = earthPosition.z * 37;

    cometConfig.worldMatrix.elements[3] = cometPosition.x * 70 + 50;
    cometConfig.worldMatrix.elements[7] = cometPosition.y;
    cometConfig.worldMatrix.elements[11] = cometPosition.z * 80;

    particalOne.worldMatrix.elements[3] = cometPosition.x * 70 + 48;
    particalOne.worldMatrix.elements[7] = cometPosition.y;
    particalOne.worldMatrix.elements[11] = cometPosition.z * 80;

    particalTwo.worldMatrix.elements[3] = cometPosition.x * 70 + 45;
    particalTwo.worldMatrix.elements[7] = cometPosition.y;
    particalTwo.worldMatrix.elements[11] = cometPosition.z * 80;

    particalThree.worldMatrix.elements[3] = cometPosition.x * 70 + 42;
    particalThree.worldMatrix.elements[7] = cometPosition.y;
    particalThree.worldMatrix.elements[11] = cometPosition.z * 80;

    particalFour.worldMatrix.elements[3] = cometPosition.x * 70 + 39;
    particalFour.worldMatrix.elements[7] = cometPosition.y;
    particalFour.worldMatrix.elements[11] = cometPosition.z * 80;

    particalFive.worldMatrix.elements[3] = cometPosition.x * 70 + 46;
    particalFive.worldMatrix.elements[7] = cometPosition.y;
    particalFive.worldMatrix.elements[11] = cometPosition.z * 80;

    sunConfig.worldMatrix.multiply(new Matrix4().makeRotationY(5));
    earthConfig.worldMatrix.multiply(new Matrix4().makeRotationY(2));
    cloudsConfig.worldMatrix.multiply(new Matrix4().makeRotationY(-2));
    moonConfig.worldMatrix.multiply(new Matrix4().makeRotationX(2));
    sunHeatwave.worldMatrix.multiply(new Matrix4().makeRotationY(-5));


    mercuryConfig.render(camera, projectionMatrix, basicColorProgram);
    venusConfig.render(camera, projectionMatrix, basicColorProgram);
    earthConfig.render(camera, projectionMatrix, basicColorProgram);
    marsConfig.render(camera, projectionMatrix, basicColorProgram);
    jupiterConfig.render(camera, projectionMatrix, basicColorProgram);
    saturnConfig.render(camera, projectionMatrix, basicColorProgram);
    neptuneConfig.render(camera, projectionMatrix, basicColorProgram);
    uranusConfig.render(camera, projectionMatrix, basicColorProgram);
    spaceTop.render(camera, projectionMatrix, basicColorProgram);
    spaceBottom.render(camera, projectionMatrix, basicColorProgram);
    spaceBack.render(camera, projectionMatrix, basicColorProgram);
    spaceLeft.render(camera, projectionMatrix, basicColorProgram);
    spaceRight.render(camera, projectionMatrix, basicColorProgram);
    spaceFront.render(camera, projectionMatrix, basicColorProgram);
    ringsConfig.render(camera, projectionMatrix, basicColorProgram);
    moonConfig.render(camera, projectionMatrix, basicColorProgram);
    cometConfig.render(camera, projectionMatrix, basicColorProgram);
    particalOne.render(camera, projectionMatrix, basicColorProgram);
    particalTwo.render(camera, projectionMatrix, basicColorProgram);
    particalThree.render(camera, projectionMatrix, basicColorProgram);
    particalFour.render(camera, projectionMatrix, basicColorProgram);
    particalFive.render(camera, projectionMatrix, basicColorProgram);

    gl.useProgram(phongShaderProgram);
    var uniformsphong = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();

    gl.uniform3f(uniformsphong.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniformsphong.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    sunConfig.render(camera, projectionMatrix, phongShaderProgram);


    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    sunHeatwave.render(camera, projectionMatrix, phongShaderProgram);
    cloudsConfig.render(camera, projectionMatrix, phongShaderProgram);

    gl.disable(gl.BLEND);
    
}
