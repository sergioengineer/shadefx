import { createSignal } from "solid-js";
import "./App.css";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import {
  adjustRendererSize,
  camera,
  circularRevealPass,
  createRenderer,
  createVideo,
  filmPass,
  FullscreenTriangleGeometry,
  geometry,
  greyPass,
  mount,
  passVertex,
  renderFrag,
  resolution,
  scene,
  sobelPass,
  u_time,
} from "./shadefx/shadefx";

function App() {
  const [count, setCount] = createSignal(0);
  main();

  return <section class=""> </section>;
}

async function main() {
  document.childNodes.forEach((element) => {
    element.remove();
  });

  const { renderer, composer } = createRenderer();
  const { video, texture } = await createVideo("textures/video.mp4");

  document.body.appendChild(video);
  document.body.addEventListener("click", () => {
    if (video.paused) {
      video.currentTime = 7;
      u_time.start();
      video.play();
    } else {
      u_time.stop();
      video.pause();
    }
  });

  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_image: { value: texture },
    },
    vertexShader: await passVertex,
    fragmentShader: await renderFrag,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  composer.addPass(new RenderPass(scene, camera));

  mount(renderer, composer, []);

  window.addEventListener(
    "resize",
    () => adjustRendererSize(renderer, composer),
    false,
  );
  requestAnimationFrame(animate);

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    circularRevealPass.uniforms.u_time.value = u_time.getElapsedTime();
    composer.render();
  }
}

export default App;
