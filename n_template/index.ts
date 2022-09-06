import { THREE, OrbitControls, Stats, dat } from "../deps.ts";

let { innerWidth: width, innerHeight: height } = window;

// create a scene, camera & renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// add a cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// add axes helper
const helper = new THREE.AxesHelper(5);
scene.add(helper);

// create controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// create stats
const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new dat.GUI({ name: "Configure Cube" });

// add options to configure cube
const cubeFolder = gui.addFolder("Cube");
cubeFolder.open();

const rotationFolder = cubeFolder.addFolder("Rotation");
rotationFolder.add(cube.rotation, "x", 0, 2 * Math.PI, 0.1);
rotationFolder.add(cube.rotation, "y", 0, 2 * Math.PI, 0.1);
rotationFolder.add(cube.rotation, "z", 0, 2 * Math.PI, 0.1);
rotationFolder.open();

// camera
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "z", 0, 10, 0.1);

// render loop
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    orbitControls.update();
    stats.update();
});

// resize window
addEventListener("resize", () => {
    width = innerWidth;
    height = innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});
