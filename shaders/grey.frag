uniform sampler2D u_image;
varying vec2 vUv;

vec4 grey(vec4 color){
  float avr = ( color.r + color.g + color.b) / 3.;

  return vec4(avr, avr, avr, 1.);
}

void main() {
  vec4 color = texture2D(u_image, vUv);
  gl_FragColor = grey(color);
}
