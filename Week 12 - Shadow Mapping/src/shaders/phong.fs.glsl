precision mediump float;

uniform sampler2D uAlbedoTexture;
uniform sampler2D uShadowTexture;
uniform mat4 uLightVPMatrix;
uniform vec3 uDirectionToLight;
uniform vec3 uCameraPosition;

varying vec2 vTexCoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

// distance any direction from the current texel
// 2 = 5x5 sample
const int pcfCount = 2;
// total texels sampled
const float totalTexals = (float(pcfCount) * 2.0 + 1.0) * (float(pcfCount) * 2.0 + 1.0);
// dimensions of the shadow map
// defined in createFrameBufferResources() in app.js
const float mapSize = 2048.0;
// size of a texel
// used to convert offsets to proper size
const float texelSize = 1.0 / mapSize;

void main(void) {
    vec3 worldNormal01 = normalize(vWorldNormal);
    vec3 directionToEye01 = normalize(uCameraPosition - vWorldPosition);
    vec3 reflection01 = 2.0 * dot(worldNormal01, uDirectionToLight) * worldNormal01 - uDirectionToLight;

    float lambert = max(dot(worldNormal01, uDirectionToLight), 0.0);
    float specularIntensity = pow(max(dot(reflection01, directionToEye01), 0.0), 64.0);

    vec4 texColor = texture2D(uAlbedoTexture, vTexCoords);

    // 2do #5
    // transform the world position into the lights clip space (clip space and NDC will be the same for orthographic projection)
    vec4 lightSpaceNDC = uLightVPMatrix * vec4(vWorldPosition, 1.0);

    // scale and bias the light-space NDC xy coordinates from [-1, 1] to [0, 1]
    vec2 lightSpaceUV = lightSpaceNDC.xy * 0.5 + 0.5;

    // 2do #6
    // Sample from the shadow map texture using the previously calculated lightSpaceUV
    vec4 shadowColor = texture2D(uShadowTexture, lightSpaceUV);

    // 2do #7 scale and bias the light-space NDC z coordinate from [-1, 1] to [0, 1]
    float lightDepth = lightSpaceNDC.z * 0.5 + 0.5;

    // use this as part of 2do #10
    float bias = 0.004;
    // number of samples in shadow for the fragment
    float total = 0.0;

    // loop over the adjacent samples
    for (int x = -pcfCount; x <= pcfCount; x++) {
        for (int y = -pcfCount; y <= pcfCount; y++) {
            // is each sample in shadow?
            float nearest = texture2D(uShadowTexture, lightSpaceUV + vec2(x, y) * texelSize).z;
            if (lightDepth > nearest + bias) {
                total += 1.0;
            }
        }
    }

    // set the percentage of light we think the fragment should be in
    total /= totalTexals;

    float lightFactor = max(1.0 - total, 0.0);
    vec3 ambient = vec3(0.13, 0.13, 0.13) * texColor.rgb;
    vec3 diffuseColor = texColor.rgb * lambert;
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specularIntensity;
    vec3 finalColor = ambient + diffuseColor + specularColor;
    finalColor.rgb = finalColor.rgb * lightFactor;
    gl_FragColor = vec4(finalColor, 1.0);
}
