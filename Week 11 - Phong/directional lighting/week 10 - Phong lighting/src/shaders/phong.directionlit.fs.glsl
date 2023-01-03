precision highp float;

uniform vec3 uLightDirection;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // to do - diffuse contribution
    // 1. normalize the light direction and store in a separate variable
    vec3 normalizedLight = normalize(uLightDirection * 2.0);
    // 2. normalize the world normal and store in a separate variable
    vec3 normalizedWNormal = normalize(vWorldNormal);
    // 3. calculate the lamberty term
    float lambert = dot(normalizedWNormal, normalizedLight);

    // to do - specular contribution
    // 1. in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 eyeVector = normalize(uCameraPosition - vWorldPosition);
    // 2. in world space, calculate the reflection vector (normalized)
    vec3 reflectionVector = normalize(2.0 * lambert * normalizedWNormal - normalizedLight);
    // 3. calculate the phong term
    float phong = pow(max(dot(reflectionVector, eyeVector), 0.0), 128.0);
    float light = 1.0;
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;


    // to do - combine
    // 1. apply light and material interaction for diffuse value by using the texture colour as the material
    vec3 diffuseColor = light * albedo * max(lambert, 0.0);
    // 2. apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    vec3 specularColor = light * vec3(0.13, 0.13, 0.13) * phong;

    //vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.13;
    // vec3 diffuseColor
    // vec3 specularColor

    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);
}
