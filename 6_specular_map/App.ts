import { THREE, OrbitControls, Stats } from "../deps.ts";

interface AppProps {
    enableControls?: boolean;
    enableHelper?: boolean;
    enableStats?: boolean;
}

export default class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private enableControls: boolean | undefined;
    private enableHelper: boolean | undefined;
    private enableStats: boolean | undefined;

    private controls: OrbitControls | undefined;
    private stats: Stats | undefined;

    private animationLoopCb: (app: App) => void = (_) => {};

    constructor(props: AppProps = {}) {
        Object.assign(this, props);

        const { aspect } = this.getSize();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.initThree();
        this.animationLoop();
        this.addEventListeners();
    }

    private initThree() {
        const { width, height } = this.getSize();

        // adjust camera
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        // append canvas renderer to dom
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);

        // enable controls, axes helper, and stats
        if (this.enableControls) {
            this.controls = new OrbitControls(
                this.camera,
                this.renderer.domElement
            );
        }

        if (this.enableHelper) {
            this.scene.add(new THREE.AxesHelper(5));
        }

        if (this.enableStats) {
            this.stats = Stats();
            document.body.appendChild(this.stats.dom);
        }
    }

    private animationLoop() {
        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);
            this.controls && this.controls.update();
            this.animationLoopCb(this);
        });
    }

    private addEventListeners() {
        // resize canvas
        addEventListener("resize", () => {
            const { width, height, aspect } = this.getSize();
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    setAnimationLoop(cb: (app: App) => void) {
        this.animationLoopCb = cb;
    }

    getScene() {
        return this.scene;
    }

    getSize() {
        return {
            width: innerWidth,
            height: innerHeight,
            aspect: innerWidth / innerHeight,
        };
    }
}
