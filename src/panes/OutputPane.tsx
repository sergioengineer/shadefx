import { RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
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
  luminancePass,
} from "../lib/shadefx";
import { DOMElement } from "solid-js/jsx-runtime";

export function OutputPane() {
  let parent: HTMLElement | undefined;
  main(parent);
  return <article ref={parent} class="flex flex-1"></article>;
}

async function main(parent: DOMElement | undefined) {
  if (!parent) return;

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
    composer.passes.forEach((pass) => {
      if (!(pass as ShaderPass).uniforms?.u_time) return;

      (pass as ShaderPass).uniforms.u_time.value = u_time.getElapsedTime();
    });
    composer.render();
  }
}
