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

scene.add(new THREE.AxesHelper(5));

// create controls
const orbitControls = new OrbitControls(camera, renderer.domElement);

// create stats
const stats = Stats();
document.body.appendChild(stats.dom);

// create a dat.GUI
const gui = new dat.GUI({ name: "Configure Geometries" });

// create material & material folder
const material = new THREE.MeshBasicMaterial({
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
    // THREE.BackSide would be useful if the camera was inside of the geometry

    map: new THREE.TextureLoader().load("/assets/course/grid.png"),
    envMap: (() => {
        const envTexture = new THREE.CubeTextureLoader().load(
            ["px", "nx", "py", "ny", "pz", "nz"].map(
                (path) => `/assets/course/${path}_50.png`
            )
        );
        envTexture.mapping = THREE.CubeRefractionMapping;
        return envTexture;
    })(),
});

const materialData = {
    color: material.color.getHex(),
};

const materialFolder = gui.addFolder("THREE.MeshBasicMaterial");
materialFolder.add(material, "transparent").onChange(updateMaterial);
materialFolder.add(material, "opacity", 0, 1, 0.01).onChange(updateMaterial);
materialFolder.add(material, "wireframe");
materialFolder.add(material, "reflectivity", 0, 1, 0.1);
materialFolder.add(material, "refractionRatio", 0, 1, 0.1);
materialFolder
    .add(material, "combine", {
        MultiplyOperation: THREE.MultiplyOperation, // default
        MixOperation: THREE.MixOperation,
        AddOperation: THREE.AddOperation,
    })
    .onChange(updateMaterial);
materialFolder
    .addColor(materialData, "color")
    .onChange(() => material.color.setHex(Number(materialData.color)));

// add meshes to the scene
const cube = addMesh("Cube", 0, THREE.BoxGeometry, {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
});

addMesh("Sphere", 4, THREE.SphereGeometry, {
    radius: 1,
    widthSegments: 8,
    heightSegments: 6,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
});

addMesh(
    "Icosohedron",
    8,
    THREE.IcosahedronGeometry,
    {
        radius: 1,
        detail: 0,
    },
    (state) => ({
        ...state,
        detail: parseInt(state.detail.toString()),
    })
);

addMesh("Torus", 12, THREE.TorusGeometry, {
    radius: 1,
    tube: 0.4,
    radialSegments: 8,
    tubularSegments: 6,
    arc: Math.PI * 2,
});

addMesh("Torus Knot", 16, THREE.TorusKnotGeometry, {
    radius: 1,
    tube: 0.4,
    radialSegments: 64,
    tubularSegments: 8,
    p: 2,
    q: 3,
});

addMesh("Plane", 20, THREE.PlaneGeometry, {
    width: 1,
    height: 1,
    widthSegments: 1,
    heightSegments: 1,
});

const debugWindow = document.body.querySelector(
    ".debug__content"
) as HTMLDivElement;

// render loop
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    orbitControls.update();
    stats.update();

    debugWindow.innerHTML = `Cube Matrix<br />${cube.matrix.elements
        .map((n: number) => n.toFixed(1))
        .join("<br />")}`;
});

// resize window
addEventListener("resize", () => {
    width = innerWidth;
    height = innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

function updateMaterial() {
    material.side = Number(material.side);
    material.combine = Number(material.combine);
    material.needsUpdate = true;
}

/**
 * Utility to create several kinds of configurable meshes
 * @param title - GUI folder name
 * @param x  - Location of mesh
 * @param meshType - Type of mesh
 * @param state - Args (in dict form) for mesh
 * @param modifyState - Alter args in some way before geometry is refreshed
 * @returns
 */
function addMesh(
    title: string,
    x: number,
    // deno-lint-ignore no-explicit-any
    meshType: any,
    state: Record<string, number>,
    modifyState:
        | ((state: Record<string, number>) => Record<string, number>)
        | null = null
) {
    // create mesh
    const mesh = new THREE.Mesh(
        new meshType(...Object.values(state)),
        material
    );

    mesh.position.x = x;
    scene.add(mesh);

    // create GUI stuff
    const properties = ["Position", "Rotation", "Scale"];
    const folder = gui.addFolder(title);

    addTransformationFolders(properties, folder, mesh);
    addGeometryFolder("Geometry", folder, mesh, state, (mesh, state) => {
        mesh.geometry.dispose();
        mesh.geometry = new meshType(
            ...Object.values(modifyState ? modifyState(state) : state)
        );
    });

    return mesh;
}

/**
 * Create a transformational folder
 * @param title - Transformation property name
 * @param gui - Dat GUI thingy
 * @param object - Any kind of mesh to apply transformations to
 * @returns - The Dat GUI transformation folder
 */
function addTransformationFolder(
    title: string,
    gui: dat.GUI,
    object: THREE.Object3D
) {
    const axes: string[] = ["x", "y", "z"];
    const transformationFolder = gui.addFolder(title);

    axes.forEach((axis) => {
        transformationFolder.add(
            object[title.toLowerCase() as keyof THREE.Object3D] || {},
            axis,
            -10,
            10,
            0.1
        );
    });

    return transformationFolder;
}

/**
 * Wrapper around addTransformationFolder to create several transformation folders through an array
 * @param titles - List of folder titles (transformation names)
 * @param gui - Parent dat GUI thing
 * @param object - Mesh to manipulate
 * @returns - List of transformational folders
 */
function addTransformationFolders(
    titles: string[],
    gui: dat.GUI,
    object: THREE.Object3D
) {
    return titles.map((title) => addTransformationFolder(title, gui, object));
}

/**
 * Utility to easily create a GUI folder on making geometry
 * @param title - Name of GUI folder
 * @param state - Mesh state
 * @param mesh - Object to manipulate
 * @param regenerateGeometry - Callback function to recreate mesh geometry
 * @returns - Geometry folder
 */
function addGeometryFolder(
    title: string,
    folder: dat.GUI,
    mesh: THREE.Mesh,
    state: Record<string, number>,
    regenerateGeometry: (
        mesh: THREE.Mesh,
        state: Record<string, number>
    ) => void
) {
    const geometryFolder = folder.addFolder(title);
    Object.keys(state).forEach((key: string) => [
        geometryFolder
            .add(state, key, 0, 10, 0.1)
            .onChange(() => regenerateGeometry(mesh, state)),
    ]);

    return geometryFolder;
}
