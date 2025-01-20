import * as THREE from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { DotScreenPass } from "three/addons/postprocessing/DotScreenPass.js";
import {
  EffectComposer,
  Pass,
} from "three/examples/jsm/postprocessing/EffectComposer.js";

export const passVertex = fetch("shaders/pass.vert").then((r) => r.text());
export const renderFrag = fetch("shaders/render.frag").then((r) => r.text());
export const greyFrag = fetch("shaders/grey.frag").then((r) => r.text());
export const blurFrag = fetch("shaders/blur.frag").then((r) => r.text());
export const sobelFrag = fetch("shaders/sobel.frag").then((r) => r.text());
export const circularrevealFrag = fetch("shaders/circularreveal.frag").then(
  (r) => r.text(),
);
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { DOMElement } from "solid-js/jsx-runtime";

export const u_time = new THREE.Clock(false);
export const resolution = new THREE.Vector2(0, 0);

export class FullscreenTriangleGeometry extends THREE.BufferGeometry {
  constructor() {
    super();

    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
    );
    this.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2),
    );
  }
}

export const DefaultShader = {
  name: "GreyShader",
  uniforms: { u_image: { value: null } },
  vertexShader: await passVertex,
  fragmentShader: await greyFrag,
};
export const greyPass = new ShaderPass(
  {
    ...DefaultShader,
  },
  "u_image",
);

export const blurPass = new ShaderPass(
  {
    ...DefaultShader,
    uniforms: {
      ...DefaultShader.uniforms,
      u_resolution: { value: resolution },
    },
    name: "BlurShader",
    fragmentShader: await blurFrag,
  },
  "u_image",
);

export const sobelPass = new ShaderPass(
  {
    ...DefaultShader,
    uniforms: {
      ...DefaultShader.uniforms,
      u_resolution: { value: resolution },
    },
    name: "SobelShader",
    fragmentShader: await sobelFrag,
  },
  "u_image",
);

export const circularRevealPass = new ShaderPass(
  {
    ...DefaultShader,
    uniforms: {
      ...DefaultShader.uniforms,
      u_resolution: { value: resolution },
      u_time: { value: u_time.getElapsedTime() },
    },
    name: "circularRevealPass",
    fragmentShader: await circularrevealFrag,
  },
  "u_image",
);

export const filmPass = new FilmPass(1, false);
export const dotPass = new DotScreenPass(new THREE.Vector2(0, 0), 1, 2);

export function createVideo(src: string) {
  const video = document.createElement("video");

  video.src = src;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = false;
  video.style.display = "none";
  const texture = new THREE.VideoTexture(video);

  return new Promise((r) => {
    video.onloadeddata = () => r({ video, texture });
  }) as Promise<{ video: HTMLVideoElement; texture: THREE.VideoTexture }>;
}

export const camera = new THREE.Camera();
export const geometry = new FullscreenTriangleGeometry();
export const scene = new THREE.Scene();

export function adjustRendererSize(
  renderer: THREE.WebGLRenderer,
  composer?: EffectComposer,
) {
  const parent = renderer.domElement.parentElement!;

  resolution.x = parent.clientWidth;
  resolution.y = parent.clientHeight;

  composer?.passes.forEach((pass) => {
    const uniforms = (pass as ShaderPass).uniforms;
    if (!uniforms) return;
    if (!uniforms.u_resolution) return;

    uniforms.u_resolution.value.x = resolution.x;
    uniforms.u_resolution.value.y = resolution.y;
  });

  renderer.setSize(resolution.x, resolution.y);
  renderer.setPixelRatio(window.devicePixelRatio);
}

export function mount(
  renderer: THREE.WebGLRenderer,
  composer: EffectComposer,
  effects: Pass[],
) {
  adjustRendererSize(renderer, composer);

  composer.reset();
  effects.forEach((effect) => composer.addPass(effect));

  adjustRendererSize(renderer, composer);
}

export function createRenderer(parent: DOMElement) {
  const renderer = new THREE.WebGLRenderer();
  parent.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);

  return { composer, renderer };
}

async function main() {
  document.childNodes.forEach((element) => {
    element.remove();
  });

  const { renderer, composer } = createRenderer(document.body);
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
