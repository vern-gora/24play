import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "./three.js-master/examples/jsm/loaders/GLTFLoader";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0x89cdff);

const controls = new OrbitControls(camera, renderer.domElement);

let loader = new GLTFLoader();

let mixer;

loader.load(
  "./threejs_tz/TrackFloor.glb",
  function (gltf) {
    let trackFloor = gltf.scene;
    trackFloor.traverse(function (node) {
      if (node.isMesh) {
        node.receiveShadow = true;
      }
    });
    trackFloor.position.z = 2;
    trackFloor.scale.z = 5;
    scene.add(trackFloor);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "./threejs_tz/Stickman.glb",
  function (gltf) {
    let stickmanModel = gltf.scene;
    stickmanModel.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(stickmanModel);

    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowUp":
          stickmanModel.position.z += -3.5;
          break;
        case "ArrowLeft":
          stickmanModel.position.x += -3.5;
          break;
        case "ArrowDown":
          stickmanModel.position.z += 3.5;
          break;
        case "ArrowRight":
          stickmanModel.position.x += 3.5;
          break;
      }
    });

    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

    stickmanModel.setRotationFromQuaternion(rotationQuaternion);

    mixer = new THREE.AnimationMixer(stickmanModel);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, "Run");
    const action = mixer.clipAction(clip);
    action.play();
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "./threejs_tz/Brain.glb",
  function (gltf) {
    let brain = gltf.scene;
    brain.traverse(function (node) {
      if (node.isMesh) {
        node.receiveShadow = true;
      }
    });

    brain.position.set(3.5, 2, -7);

    brain.scale.set(2, 2, 2);

    scene.add(brain);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.x = -3;
light.position.y = 3;
light.position.z = 2;
light.castShadow = true;
scene.add(light);

camera.position.z = 10;
camera.position.y = 7;

const clock = new THREE.Clock();

function animate() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
