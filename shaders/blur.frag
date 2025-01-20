uniform sampler2D u_image;
uniform vec2 u_resolution;
varying vec2 vUv;

void main() {
  vec2 p = vec2(1., 1.) / u_resolution;
  vec4 color = texture2D(u_image, vUv + p * vec2(0., 0.)) + 
    texture2D(u_image, vUv + p * vec2(1., 0.))+
    texture2D(u_image, vUv + p * vec2(1., 1.))+
    texture2D(u_image, vUv + p * vec2(0., 1.))+
    texture2D(u_image, vUv + p * vec2(-1., 0.))+
    texture2D(u_image, vUv + p * vec2(-1., -1.))+
    texture2D(u_image, vUv + p * vec2(0., -1.)) + 
    texture2D(u_image, vUv + p * vec2(1., -1.)) +
    texture2D(u_image, vUv + p * vec2(-1., 1.));

  gl_FragColor = color / 9.;
}
