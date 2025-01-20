uniform sampler2D u_image;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;

float lease(float time, float resoldist){
  return time * resoldist * .3;
}

void main() {
  float resoldist = sqrt(u_resolution.x * u_resolution.x + u_resolution.y * u_resolution.y);
  vec2 p = vec2(1., 1.) / u_resolution;
  vec4 color = texture2D(u_image, vUv);
  float dist = sqrt(pow(vUv.x / p.x, 2.) + pow(vUv.y / p.y, 2.));
  float time = lease(u_time, resoldist);

  float t = 1. - smoothstep(time - resoldist * .15, time, dist);

  gl_FragColor = vec4(color.rgb, t);
}
