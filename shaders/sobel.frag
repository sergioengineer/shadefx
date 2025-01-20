uniform sampler2D u_image;
uniform vec2 u_resolution;
varying vec2 vUv;

void main() {
  vec2 p = vec2(1., 1.) / u_resolution;
  vec4 colorX =
    texture2D(u_image, vUv + p * vec2(1., 1.)) + 
    2. * texture2D(u_image, vUv + p * vec2(1., 0.)) + 
    texture2D(u_image, vUv + p * vec2(1., -1.)) + 

    -1. * texture2D(u_image, vUv + p * vec2(-1., 1.)) + 
    -2. * texture2D(u_image, vUv + p * vec2(-1., 0.)) + 
    -1. * texture2D(u_image, vUv + p * vec2(-1., -1.));

  vec4 colorY =
    texture2D(u_image, vUv + p * vec2(1., 1.)) + 
    2. * texture2D(u_image, vUv + p * vec2(0., 1.)) + 
    texture2D(u_image, vUv + p * vec2(-1., 1.)) + 

    -1. * texture2D(u_image, vUv + p * vec2(1., -1.)) + 
    -2. * texture2D(u_image, vUv + p * vec2(0., -1.)) + 
    -1. * texture2D(u_image, vUv + p * vec2(-1., -1.));

  vec4 bias = vec4(.2,.2,.2,1.);
  vec4 gradient = vec4(1.,1.,1.,1.) - smoothstep(0., 1., sqrt(colorX * colorX + colorY * colorY) + bias);

  gl_FragColor = vec4(gradient.rgb, 1.);
}
