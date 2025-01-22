uniform sampler2D u_image;
varying vec2 vUv;

//Kuwahara filter

void main() {
  vec4 color = texture2D(u_image, vUv);
  gl_FragColor = color;
}
