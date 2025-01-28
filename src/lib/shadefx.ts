import * as THREE from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { DotScreenPass } from "three/addons/postprocessing/DotScreenPass.js";
import { Pass } from "three/examples/jsm/postprocessing/EffectComposer.js";

export const passVertex = fetch("shaders/pass.vert").then((r) => r.text());
export const renderFrag = fetch("shaders/render.frag").then((r) => r.text());
export const greyFrag = fetch("shaders/grey.frag").then((r) => r.text());
export const luminanceFrag = fetch("shaders/luminance.frag").then((r) =>
  r.text(),
);
export const blurFrag = fetch("shaders/blur.frag").then((r) => r.text());
export const sobelFrag = fetch("shaders/sobel.frag").then((r) => r.text());
export const circularrevealFrag = fetch("shaders/circularreveal.frag").then(
  (r) => r.text(),
);
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { DOMElement } from "solid-js/jsx-runtime";
import { WebGLRenderTarget } from "three";
import {
  ClearMaskPass,
  CopyShader,
  MaskPass,
} from "three/examples/jsm/Addons.js";

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
  renderer.domElement.style.backgroundColor = "white";
  parent.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);

  return { composer, renderer };
}

type Node<T extends string = string> = { type: T };
type InputNode = Node<"input"> & (VideoInputNode | ImageInputNode);
type BakedShaderType = "grey" | "luminance" | "sobel" | "film" | "xdog" | "circular_reveal" | "dot" | "blur";
export type ShaderType = BakedShaderType | string & {}
type ShaderNode = Node<"shader"> & { shaderType: ShaderType, shader: Pass };
type VideoInputNode = {
  textureType: "video";
  input: HTMLVideoElement;
  texture: THREE.VideoTexture;
  pass: RenderPass;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
};
type ImageInputNode = {
  textureType: "image";
};

export async function createInputNode(
  type: InputNode["textureType"],
  src: string,
) {
  if (type === "video") {
    const node: Partial<InputNode> = {
      type: "input",
      textureType: type,
    };
    const video = document.createElement("video");

    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.style.display = "none";

    const texture = new THREE.VideoTexture(video);

    node.input = video;
    node.texture = texture;
    node.pass = new RenderPass(SignalChain.scene, SignalChain.camera);

    await new Promise((r) => {
      video.onloadeddata = () => r(true);
    });

    node.material = new THREE.ShaderMaterial({
      uniforms: {
        u_image: { value: texture },
      },
      vertexShader: await passVertex,
      fragmentShader: await renderFrag,
    });

    node.mesh = new THREE.Mesh(geometry, node.material);
    scene.add(node.mesh);

    return node as VideoInputNode;
  }
}

const DefaultShader = {
  name: "GreyShader",
  uniforms: { u_image: { value: null } },
  vertexShader: await passVertex,
  fragmentShader: await greyFrag,
};

export async function createDotPassNode() {
  const shader = new DotScreenPass(new THREE.Vector2(0, 0), 1, 2);

  const node: ShaderNode = {
    type: "shader",
    shaderType: "dot",
    shader
  };
  return node;
}

export async function createCircularRevealPassNode() {
  const shader = new ShaderPass(
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

  const node: ShaderNode = {
    type: "shader",
    shaderType: "circular_reveal",
    shader
  };
  return node;
}

export async function createSobelPassNode() {
  const shader = new ShaderPass(
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

  const node: ShaderNode = {
    type: "shader",
    shaderType: "sobel",
    shader
  };

  return node;
}

export async function createFilmPassNode() {
  const shader = new FilmPass(1, false);

  const node: ShaderNode = {
    type: "shader",
    shaderType: "film",
    shader
  };

  return node;
}

export async function createBlurPassNode() {
  const shader = new ShaderPass(
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

  const node: ShaderNode = {
    type: "shader",
    shaderType: "blur",
    shader
  };
  return node;
}

export async function createLuminancePassNode() {
  const shader = new ShaderPass(
    {
      ...DefaultShader,
      fragmentShader: await luminanceFrag,
    },
    "u_image",
  );

  const node: ShaderNode = {
    type: "shader",
    shaderType: "grey",
    shader
  };
  return node;
}

export async function createGreyPassNode() {
  const shader = new ShaderPass(
    {
      ...DefaultShader,
    },
    "u_image",
  );

  const node: ShaderNode = {
    type: "shader",
    shaderType: "grey",
    shader
  };
  return node;
}

class SignalChain {
  composer: EffectComposer;
  renderer: THREE.WebGLRenderer;
  parent: DOMElement;
  readonly nodes: Node[] = [];
  static camera = new THREE.Camera();
  static geometry = new FullscreenTriangleGeometry();
  static scene = new THREE.Scene();

  constructor(parent: DOMElement) {
    this.parent = parent;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.domElement.style.backgroundColor = "white";
    this.parent.appendChild(this.renderer.domElement);
    this.composer = new EffectComposer(this.renderer);
  }

  addNode(node: Node) {
    console.assert(!!node, "Node was expected");

    const hasInputNode = this.nodes.some((x) => x.type === "input");
    if (!hasInputNode && node.type === "input") {
      this.nodes.splice(0, 0, node);
      return;
    }

    this.nodes.push(node);
  }
}

//reinplement class so that we have more control of the buffer swaping process
class EffectComposer {
  renderer: THREE.WebGLRenderer;
  pixelRatio: number;
  width: number;
  height: number;
  renderTarget1: WebGLRenderTarget;
  renderTarget2: WebGLRenderTarget;
  writeBuffer: WebGLRenderTarget;
  readBuffer: WebGLRenderTarget;
  renderToScreen: boolean;
  passes: Pass[] = [];
  copyPass: ShaderPass;
  clock: THREE.Clock;

  constructor(
    renderer: THREE.WebGLRenderer,
    renderTarget?: THREE.WebGLRenderTarget,
  ) {
    this.renderer = renderer;

    this.pixelRatio = renderer.getPixelRatio();

    if (renderTarget === undefined) {
      const size = renderer.getSize(new THREE.Vector2());
      this.width = size.width;
      this.height = size.height;

      renderTarget = new WebGLRenderTarget(
        this.width * this.pixelRatio,
        this.height * this.pixelRatio,
        { type: THREE.HalfFloatType },
      );
      renderTarget.texture.name = "EffectComposer.rt1";
    } else {
      this.width = renderTarget.width;
      this.height = renderTarget.height;
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = "EffectComposer.rt2";

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.renderToScreen = true;

    this.passes = [];

    this.copyPass = new ShaderPass(CopyShader);
    this.copyPass.material.blending = THREE.NoBlending;

    this.clock = new THREE.Clock();
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  addPass(pass: Pass) {
    this.passes.push(pass);
    pass.setSize(this.width * this.pixelRatio, this.height * this.pixelRatio);
  }

  insertPass(pass: Pass, index: number) {
    this.passes.splice(index, 0, pass);
    pass.setSize(this.width * this.pixelRatio, this.height * this.pixelRatio);
  }

  removePass(pass: Pass) {
    const index = this.passes.indexOf(pass);

    if (index !== -1) {
      this.passes.splice(index, 1);
    }
  }

  isLastEnabledPass(passIndex: number) {
    for (let i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false;
      }
    }

    return true;
  }

  render(deltaTime?: number) {
    // deltaTime value is in seconds

    if (deltaTime === undefined) {
      deltaTime = this.clock.getDelta();
    }

    const currentRenderTarget = this.renderer.getRenderTarget();

    let maskActive = false;

    for (let i = 0, il = this.passes.length; i < il; i++) {
      const pass = this.passes[i];

      if (pass.enabled === false) continue;

      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
      pass.render(
        this.renderer,
        this.writeBuffer,
        this.readBuffer,
        deltaTime,
        maskActive,
      );

      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;

          //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
          stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);

          this.copyPass.render(
            this.renderer,
            this.writeBuffer,
            this.readBuffer,
            deltaTime,
            maskActive,
          );

          //context.stencilFunc( context.EQUAL, 1, 0xffffffff );
          stencil.setFunc(context.EQUAL, 1, 0xffffffff);
        }

        this.swapBuffers();
      }

      if (MaskPass !== undefined) {
        if (pass instanceof MaskPass) {
          maskActive = true;
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false;
        }
      }
    }

    this.renderer.setRenderTarget(currentRenderTarget);
  }

  reset(renderTarget?: THREE.WebGLRenderTarget) {
    if (renderTarget === undefined) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.pixelRatio = this.renderer.getPixelRatio();
      this.width = size.width;
      this.height = size.height;

      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize(
        this.width * this.pixelRatio,
        this.height * this.pixelRatio,
      );
    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    const effectiveWidth = this.width * this.pixelRatio;
    const effectiveHeight = this.height * this.pixelRatio;

    this.renderTarget1.setSize(effectiveWidth, effectiveHeight);
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight);

    for (let i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight);
    }
  }

  setPixelRatio(pixelRatio: number) {
    this.pixelRatio = pixelRatio;

    this.setSize(this.width, this.height);
  }

  dispose() {
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();

    this.copyPass.dispose();
  }
}

export { EffectComposer };
