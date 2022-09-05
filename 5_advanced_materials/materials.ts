import { THREE } from "../deps.ts";

export const colors = {
    background: new THREE.Color("#000"),
    primary: new THREE.Color("#c9ada7"),
    highlight: new THREE.Color("#f2e9e4"),
};

export const materials = [
    THREE.MeshBasicMaterial,
    THREE.MeshNormalMaterial,
    THREE.MeshLambertMaterial,
    THREE.MeshPhongMaterial,
    THREE.MeshStandardMaterial,
];

export const materialsOptions = materials.reduce(
    (acc, curr, i) => ({
        ...acc,
        [`THREE.${curr.name}`]: i,
    }),
    {}
);

export const materialsProps = {
    emissive: createProp("color"),
    color: createProp("color"),
    specular: createProp("color"),
    shininess: createProp("range", 0, 2048),
    roughness: createProp("range", 0, 1),
    metalness: createProp("range", 0, 1),
};

// deno-lint-ignore no-explicit-any
function createProp(type: string, min = 0, max = 0) {
    return { type, min, max };
}
