precision mediump float;

uniform float uMix;
varying vec2 vUv;
varying vec3 vColor;

void main() {
  vec3 base = vec3(0.86, 0.82, 0.78);
  vec3 mixedColor = mix(base, vColor, uMix);
  gl_FragColor = vec4(mixedColor, 1.0);
}
