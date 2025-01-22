
uniform sampler2D u_image;
varying vec2 vUv;

float grey(vec3 color){
   return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec4 color = texture2D(u_image, vUv);
  float greyed = grey(vec3(color));
  gl_FragColor = vec4(greyed, greyed, greyed, 1.);
}

