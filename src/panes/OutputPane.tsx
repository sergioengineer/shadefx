import { RenderPass } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import {
  createVideo,
  u_time,
  passVertex,
  renderFrag,
  geometry,
  scene,
  camera,
  mount,
  adjustRendererSize,
  circularRevealPass,
  createRenderer,
  filmPass,
  greyPass,
  sobelPass,
} from "../lib/shadefx";
import { DOMElement } from "solid-js/jsx-runtime";

export function OutputPane() {
  const parent = <article class="flex-1 flex"></article>;
  main(parent as any);
  return parent;
}

async function main(parent: DOMElement) {
  const { renderer, composer } = createRenderer(parent);
  const { video, texture } = await createVideo("textures/video.mp4");

  parent.appendChild(video);
  parent.addEventListener("click", () => {
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

  mount(renderer, composer, [greyPass, sobelPass]);

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
