import { THREE, OrbitControls, Stats, dat } from "../deps.ts";
import {
    colors,
    materials,
    materialsOptions,
    materialsProps,
} from "./materials.ts";

let { innerWidth: width, innerHeight: height } = window;

// create a scene, camera & renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(colors.background);
scene.add(new THREE.AxesHelper(5));

// create controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// create stats
const stats = Stats();
document.body.appendChild(stats.dom);

const materialData = {
    material: 0,
    props: {
        emissive: colors.background.getHex(),
        color: colors.primary.getHex(),
        specular: colors.highlight.getHex(),
        shininess: 1000,
        roughness: 0.5,
        metalness: 0.5,
        clearcoat: 0,
        clearcoatRoughness: 0,
    },
};

// add mesh to the scene
// deno-lint-ignore no-explicit-any
let material: any;

const geometry = new THREE.TorusKnotGeometry();
material = generateMaterial(false);
const mesh = new THREE.Mesh(geometry, material);

const matcapTexture = new THREE.TextureLoader().load(
    "/assets/course/copper.png"
);

scene.add(mesh);
scene.add(createLight(10, 10, 10));
scene.add(createLight(-10, -10, -10));

// create a dat.GUI
const gui = new dat.GUI({ name: "Configure Material" });
gui.add(materialData, "material", materialsOptions).onChange(() => {
    material = generateMaterial();
    mesh.material = material;
});

// add ways to configure props
Object.keys(materialsProps).forEach((_key) => {
    const key = _key as keyof typeof materialsProps;

    const propData = materialsProps[key];

    if (propData.type === "color") {
        gui.addColor(materialData.props, key).onChange(() => {
            if (key in material) {
                material[key].setHex(Number(materialData.props[key]));
                updateMaterial();
            }
        });
    } else if (propData.type === "range") {
        gui.add(materialData.props, key, propData.min, propData.max).onChange(
            () => {
                if (key in material) {
                    material[key] = materialData.props[key];
                }
                updateMaterial();
            }
        );
    }
});

const debugWindow = document.body.querySelector(
    ".debug__content"
) as HTMLDivElement;

debugWindow.innerHTML =
    'Note: emissive means the color will show even without lighting. Also, some options like "specular" will throw warnings in the console because they don\'t exist on all materials';

// render loop
renderer.setAnimationLoop(() => {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    mesh.rotation.z += 0.01;

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

function createLight(...position: [number, number, number]) {
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(...position);
    return light;
}

function updateMaterial() {
    mesh.material.needsUpdate = true;
}

function generateMaterial(setMaterial = true) {
    const materialType = materials[Number(materialData.material)];
    material = new materialType(materialData.props);
    if (materialType.name === "MeshMatcapMaterial") {
        material.matcap = matcapTexture;
    }

    if (setMaterial) {
        mesh.material = material;
    }

    return material;
}
