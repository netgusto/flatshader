#ifdef GL_ES
precision highp float;
#endif

attribute vec3 fNormal;
varying vec3 vNormal;

void main()
{
    vec4 rotatedNormal = normalize(modelMatrix * vec4(fNormal, 1.0));
    vNormal = vec3(rotatedNormal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}

