import { THREE, dat } from "../deps.ts";
import App from "./App.ts";

const app = new App({
    enableControls: true,
    enableHelper: true,
    enableStats: true,
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial()
);

app.getScene().add(cube);

app.setAnimationLoop((_) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
});
