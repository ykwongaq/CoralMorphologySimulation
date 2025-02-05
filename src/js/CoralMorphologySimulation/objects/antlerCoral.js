import RandomNumberGenerator from "../randomNumberGenerator";
import MyAnimateObject from "./myAnimateObject";

import Attractor from "../SCA/attractor";
import Node from "../SCA/node";
import SCA from "../SCA/spaceColonizationAlgorithm";
import Utils from "../utils";

import * as THREE from "three";

export default class AntlerCoral extends MyAnimateObject {
    static PARAMS = {
        radius: 40,
        numAttractors: 1000,
        seed: RandomNumberGenerator.DEFAULT_SEED,
        maxIteration: 1000,

        // Attractors
        influenceDistance: 10,
        killDistance: 2,

        // Node
        segmentLength: 1,
        basicThickness: 20,
        canalizeThickness: 0.01,
        maxThickness: 40,
        color: {
            r: 139,
            g: 69,
            b: 19,
        },
    };

    static NAME = "Antler Coral";

    static getParams() {
        return AntlerCoral.PARAMS;
    }

    constructor(
        scene,
        debugMode = false,
        radius = AntlerCoral.PARAMS.radius,
        numAttractors = AntlerCoral.PARAMS.numAttractors,
        seed = AntlerCoral.PARAMS.seed,
        maxIteration = AntlerCoral.PARAMS.maxIteration,
        influenceDistance = AntlerCoral.PARAMS.influenceDistance,
        killDistance = AntlerCoral.PARAMS.killDistance,
        segmentLength = AntlerCoral.PARAMS.segmentLength,
        basicThickness = AntlerCoral.PARAMS.basicThickness,
        canalizeThickness = AntlerCoral.PARAMS.canalizeThickness,
        maxThickness = AntlerCoral.PARAMS.maxThickness,
        colorRGB = AntlerCoral.PARAMS.color
    ) {
        super(scene, debugMode);
        RandomNumberGenerator.setSeed(seed);
        this.radius = radius;
        this.numAttractors = numAttractors;
        this.influenceDistance = influenceDistance;
        this.killDistance = killDistance;
        this.segmentLength = segmentLength;
        this.basicThickness = basicThickness;
        this.canalizeThickness = canalizeThickness;
        this.maxThickness = maxThickness;
        this.colorRGB = colorRGB;
        this.maxIteration = maxIteration;

        this.SCA = null;
    }

    generate() {
        const attractors = this.generateAttractors();

        if (this.debugMode) {
            for (const attractor of attractors) {
                attractor.generate();
            }
        }
        const nodes = [];

        const initNode = new Node(
            this.scene,
            this.debugMode,
            new THREE.Vector3(0, 0, 0),
            null,
            this.basicThickness,
            this.canalizeThickness,
            this.maxThickness,
            this.colorRGB
        );
        nodes.push(initNode);
        this.SCA = new SCA(
            attractors,
            nodes,
            this.segmentLength,
            this.maxIteration
        );
    }

    generateAttractors() {
        const attractors = [];
        for (let i = 0; i < this.numAttractors; i++) {
            const r = RandomNumberGenerator.seedRandom(0, this.radius);
            // this.radius * Math.cbrt(RandomNumberGenerator.seedRandom());
            const theta = RandomNumberGenerator.seedRandom(
                Math.PI / 4,
                (Math.PI * 3) / 4
            );
            // const phi = Math.acos(2 * RandomNumberGenerator.seedRandom() - 1);
            const phi = RandomNumberGenerator.seedRandom(
                Math.PI / 4,
                (Math.PI * 3) / 4
            );

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            const point = new THREE.Vector3(x, y, z);

            const attractor = new Attractor(
                this.scene,
                this.debugMode,
                point,
                this.influenceDistance,
                this.killDistance
            );
            attractors.push(attractor);
        }
        return attractors;
    }

    async startRender() {
        for (let i = 0; i < this.maxIteration; i++) {
            if (this.SCA.isStopped()) {
                console.log("SCA stopped");
                return;
            }
            this.SCA.step();

            const nodes = this.SCA.getNodes();
            for (let node of nodes) {
                node.generate();
            }

            if (this.debugMode) {
                this.clearAttractorsInScene();
                const attractors = this.SCA.getAttractors();
                for (let attractor of attractors) {
                    attractor.generate();
                }
            }

            await Utils.sleep(1000 / 30);
        }
        console.log("Max iteration reached");
    }

    clearAttractorsInScene() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            let child = this.scene.children[i];
            if (child.isAttractor) {
                this.scene.remove(child);
            }
        }
    }
}
