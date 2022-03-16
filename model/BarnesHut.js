import { Quad } from "./Quad.js";
import { BHTree } from "./BHTree.js";

export class BarnesHut {
    constructor() {
        this.bhtree = null;
    }

    getQuadTree() {
        return this.bhtree;
    }

    executeUpdate(bodies, sec) {
        let q = new Quad(0, 0, 2 * 1e15);
        this.bhtree = new BHTree(q);
        // If the body is still on the screen, add it to the tree
        for (let b of bodies) {
            if (b.in(q)) {
                try {
                    this.bhtree.insert(b);
                } catch (error) {
                    console.log(error);
                    continue;
                }
            }
        }
        //Now, use out methods in BHTree to update the forces,
        //traveling recursively through the tree
        for (let [i, b] of bodies.entries()) {
            b.resetForce();
            if (b.in(q)) {
                this.bhtree.updateForce(b);
            }
            b.updatePos(sec);
            if (isNaN(b.p[0]) || isNaN(b.p[1])) bodies.splice(i, 1);
        }
        return bodies;
    }
}