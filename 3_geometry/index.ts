import { THREE, OrbitControls, Stats, dat } from "../deps.ts";

let { innerWidth: width, innerHeight: height } = window;

// create a scene, camera & renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// add a cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// add axes helper
scene.add(new THREE.AxesHelper(5));

// create controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// create stats
const stats = Stats();
document.body.appendChild(stats.dom);

// create a dat.GUI
const state = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
};

const gui = new dat.GUI({ name: "Configure Cube" });

// create geometry folder
const geometryFolder = gui.addFolder("Geometry");
geometryFolder.open();
Object.keys(state).forEach((key: string) => {
    geometryFolder
        .add(state, key, 1, 30, 0.1)
        .onChange(() => regenerateGeometry(cube));
});

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

function regenerateGeometry(cube: THREE.Mesh) {
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(
        state.width,
        state.height,
        state.depth,
        state.widthSegments,
        state.heightSegments,
        state.depthSegments
    );
}
