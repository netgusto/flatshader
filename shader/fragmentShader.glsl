#define M_PI 3.1415926535897932384626433832795
#ifdef GL_ES
precision highp float;
#endif

uniform float alpha;

varying vec3 vNormal;
varying vec3 vFNormal;

uniform bool blend;
uniform vec3 colors[6];

float intensity(float angle) {
    return min(1.0, max(angle, 0.0));
}

void main() {
    // One colour per axis direction (x, y, z, -x, -y, -z)
    vec3 baseColor = vec3(1.0, 1.0, 1.0);

    vec3 normal = normalize(vNormal);

    float angles[6];
    angles[0] = dot(normal, vec3(1.0, 0.0, 0.0));   // x
    angles[1] = dot(normal, vec3(0.0, 1.0, 0.0));   // y
    angles[2] = dot(normal, vec3(0.0, 0.0, 1.0));   // z
    angles[3] = dot(normal, vec3(-1.0, 0.0, 0.0));  // -x
    angles[4] = dot(normal, vec3(0.0, -1.0, 0.0));  // -y
    angles[5] = dot(normal, vec3(0.0, 0.0, -1.0));  // -z

    vec3 lightColor;

    if (!blend) {
        // No color blend
        float maxAngle = -1.0;
        for(int i = 0; i < 6; i++) {
            if(angles[i] > maxAngle) {
                maxAngle = angles[i];
                lightColor = colors[i];
            }
        }
    } else {
        // blending colors based on angles
        float intensities[6];
        intensities[0] = intensity(angles[0]);
        intensities[1] = intensity(angles[1]);
        intensities[2] = intensity(angles[2]);
        intensities[3] = intensity(angles[3]);
        intensities[4] = intensity(angles[4]);
        intensities[5] = intensity(angles[5]);

        lightColor =
            colors[0] * intensities[0] +
            colors[1] * intensities[1] +
            colors[2] * intensities[2] +
            colors[3] * intensities[3] +
            colors[4] * intensities[4] +
            colors[5] * intensities[5]
        ;
    }

    // blending color with base color
    vec3 solvedColor = vec3(
        (lightColor.x * baseColor.x),
        (lightColor.y * baseColor.y),
        (lightColor.z * baseColor.z)
    );

    gl_FragColor = vec4(
        solvedColor.x,
        solvedColor.y,
        solvedColor.z,
        alpha
    );
}