import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

import {
  simulationVertexShader,
  simulationFragmentShader,
  renderVertexShader,
  renderFragmentShader,
} from "./shader.js";

document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const simScene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const mouse = new THREE.Vector2(0, 0);
  let frame = 0;

  const ws = new WebSocket("ws://localhost:8889");

  const sensorPositions = { w1: 0, w2: 0, h: 0 };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.sensor && data.distance !== undefined) {
      sensorPositions[data.sensor] = data.distance;
      const { x, y } = mapToScreen(sensorPositions);
      mouse.x = x * window.innerWidth * window.devicePixelRatio;
      mouse.y = y * window.innerHeight * window.devicePixelRatio;
    }
  };

function mapToScreen(sensors) {
  const { w1, w2, h } = sensors;
  let x = h / 16.46;          // normalizing by max h
  x = Math.min(1.0, Math.max(0.0, x));
  let w = (w1 < 11.5 && w2 >= 11.5) ? w1 : w2;
  let y = w / 11.51;
  y = Math.min(1.0, Math.max(0.0, y));
  x = 1.0 - x; 
  y = 1.0 - y; // flip x and y

  return { x, y };
}

  const width = window.innerWidth * window.devicePixelRatio;
  const height = window.innerHeight * window.devicePixelRatio;
  const options = {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
    depthBuffer: false,
  };
  let rtA = new THREE.WebGLRenderTarget(width, height, options);
  let rtB = new THREE.WebGLRenderTarget(width, height, options);

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null },
      mouse: { value: mouse },
      resolution: { value: new THREE.Vector2(width, height) },
      time: { value: 0 },
      frame: { value: 0 },
    },
    vertexShader: simulationVertexShader,
    fragmentShader: simulationFragmentShader,
  });

  const renderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null },
      textureB: { value: null },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: renderVertexShader,
    fragmentShader: renderFragmentShader,
    transparent: true,
  });

  const plane = new THREE.PlaneGeometry(2, 2);
  const simQuad = new THREE.Mesh(plane, simMaterial);
  const renderQuad = new THREE.Mesh(plane, renderMaterial);

  simScene.add(simQuad);
  scene.add(renderQuad);

const video = document.createElement("video");
video.src = "./fishvid.mp4";
video.loop = true;
video.muted = true;
video.playsInline = true;
video.autoplay = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);;

  renderer.domElement.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX * window.devicePixelRatio;
    mouse.y = (window.innerHeight - e.clientY) * window.devicePixelRatio;
  });

  renderer.domElement.addEventListener("mouseleave", () => {
    mouse.set(0, 0);
  });

  const animate = () => {
    simMaterial.uniforms.frame.value = frame++;
    simMaterial.uniforms.time.value = performance.now() / 1000;
    simMaterial.uniforms.textureA.value = rtA.texture;

    renderer.setRenderTarget(rtB);
    renderer.render(simScene, camera);

    renderMaterial.uniforms.textureA.value = rtB.texture;
    renderMaterial.uniforms.textureB.value = videoTexture;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    const temp = rtA;
    rtA = rtB;
    rtB = temp;

    requestAnimationFrame(animate);
  };

  animate();
});