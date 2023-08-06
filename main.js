import * as THREE from "https://threejs.org/build/three.module.js";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";

const gameContainer = document.getElementById("game-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
gameContainer.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const track = new THREE.Mesh(planeGeometry, planeMaterial);
track.position.set(0, -1, 0);
scene.add(track);

const loader = new GLTFLoader();

loader.load("./threejs_tz/Brain.glb", (brainGltf) => {
  const brainModel = brainGltf.scene;
  const numberOfBrains = 10;

  for (let i = 0; i < numberOfBrains; i++) {
    const brain = brainModel.clone();
    const x = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    brain.position.set(x, 0, z);
    scene.add(brain);
  }
});

loader.load("./threejs_tz/Stickman.glb", (gltf) => {
  const character = gltf.scene;
  scene.add(character);

  const mixer = new THREE.AnimationMixer(character);
  const animations = gltf.animations;

  if (animations && animations.length) {
    const runAnimation = mixer.clipAction(animations[0]);
    runAnimation.play();
  }

  function updateAnimations(deltaTime) {
    mixer.update(deltaTime);
  }

  function updateCharacterMovement() {
    character.position.z -= 0.05;
  }

  function animate() {
    const deltaTime = clock.getDelta();

    updateCharacterMovement();
    updateAnimations(deltaTime);

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  animate();
});

loader.load("./threejs_tz/TrackFloor.glb", (gltf) => {
  const trackModel = gltf.scene;
  scene.add(trackModel);
});

const touchStartX = 0;
const touchEndX = 0;

gameContainer.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
});

gameContainer.addEventListener("touchmove", (event) => {
  touchEndX = event.touches[0].clientX;
});

gameContainer.addEventListener("touchend", () => {
  const swipeDistance = touchEndX - touchStartX;

  if (swipeDistance > 0) {
    character.position.x += 0.5;
  } else if (swipeDistance < 0) {
    character.position.x -= 0.5;
  }

  touchStartX = 0;
  touchEndX = 0;
});

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
});

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});

const clock = new THREE.Clock();
const scoreElement = document.getElementById("score");
let score = 0;

function updateScoreDisplay() {
  scoreElement.textContent = `Score: ${score}`;
}

function checkCollisions() {
  const characterPosition = character.position.clone();

  scene.children.forEach((child) => {
    if (child.userData.type === "brain") {
      const brainPosition = child.position.clone();
      const distance = characterPosition.distanceTo(brainPosition);

      if (distance < 1) {
        score++;
        updateScoreDisplay();

        scene.remove(child);
      }
    }
  });
}

function animate() {
  const deltaTime = clock.getDelta();

  updateCharacterMovement();
  updateAnimations(deltaTime);
  checkCollisions();

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
