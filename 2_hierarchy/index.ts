import { Object3D } from "https://cdn.skypack.dev/-/three@v0.144.0-AlFdFwNq43CpYVJalNyb/dist=es2019,mode=types/index.d.ts";
import { THREE, OrbitControls, Stats, dat } from "../deps.ts";

let { innerWidth: width, innerHeight: height } = window;

// create a scene, camera & renderer
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// create controls & stats
const orbitControls = new OrbitControls(camera, renderer.domElement);
const stats = Stats();
document.body.appendChild(stats.dom);

// add lights
scene.add(createLight(10, 10, 10));
scene.add(createLight(-10, 10, 10));

// add balls
const ballsCount = 3;
const balls: Object3D[] = [];

for (let i = 0; i < ballsCount; i++) {
    const parent: Object3D = balls[balls.length - 1] || scene;
    balls.push(createSphere(parent, 4));
}

// create a dat.GUI
const gui = new dat.GUI({ name: "Configure Cube" });

balls.forEach((ball, i) => {
    const ballFolder = gui.addFolder(`Ball ${i + 1}`);

    const rotationFolder = ballFolder.addFolder("Rotation");
    rotationFolder.add(ball.rotation, "x", 0, Math.PI * 2, 0.01);
    rotationFolder.add(ball.rotation, "y", 0, Math.PI * 2, 0.01);
    rotationFolder.add(ball.rotation, "z", 0, Math.PI * 2, 0.01);

    const positionFolder = ballFolder.addFolder("Position");
    positionFolder.add(ball.position, "x", -10, 10, 0.1);
    positionFolder.add(ball.position, "y", -10, 10, 0.1);
    positionFolder.add(ball.position, "z", -10, 10, 0.1);

    const scaleFolder = ballFolder.addFolder("Scale");
    scaleFolder.add(ball.scale, "x", 0, 10, 0.1);
    scaleFolder.add(ball.scale, "y", 0, 10, 0.1);
    scaleFolder.add(ball.scale, "z", 0, 10, 0.1);
});

const debugWindow = document.body.querySelector(
    ".debug__content"
) as HTMLDivElement;

// render loop
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    orbitControls.update();
    stats.update();

    // update debug window real world coordinates
    debugWindow.innerHTML = balls
        .map((ball, i) => {
            const name = `Ball ${i + 1}`;

            const position = new THREE.Vector3(0, 0, 0);
            ball.getWorldPosition(position);

            // prettier-ignore
            return `
                <span>${name} World Position: ${stringifyPosition(position)}</span><br />
                <span>${name} Local Position: ${stringifyPosition(ball.position)}</span>
            `
        })
        .join("<br />");
});

// resize canvas on window resize
addEventListener("resize", () => {
    width = innerWidth;
    height = innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

function createLight(...position: [number, number, number]) {
    const light = new THREE.PointLight();
    light.position.set(...position);
    return light;
}

function createSphere(parent: THREE.Object3D, relativeX: number) {
    // create color
    const color = new THREE.Color(0xffffff);
    color.setHex(Math.random() * 0xffffff);

    // create sphere & add axis to sphere & add sphere to parent
    const sphereGeometry = new THREE.SphereGeometry();
    const sphereMaterial = new THREE.MeshPhongMaterial({ color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.add(new THREE.AxesHelper(5));
    parent.add(sphere);

    sphere.position.x = relativeX;

    return sphere;
}

function stringifyPosition(position: THREE.Vector3) {
    const axes: string[] = ["x", "y", "z"];
    return `<${axes
        .map((n: string) => {
            const prop = position[n as keyof THREE.Vector3];

            if (typeof prop == "number") {
                return prop.toFixed(2);
            }
        })
        .filter((n) => !!n)
        .join(", ")}>`;
}
