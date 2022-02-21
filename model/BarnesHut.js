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
        let q = new Quad(0, 0, 2 * 1e18);
        this.bhtree = new BHTree(q);
        // If the body is still on the screen, add it to the tree
        for (let b of bodies) {
            if (b.in(q)) this.bhtree.insert(b);
        }
        //Now, use out methods in BHTree to update the forces,
        //traveling recursively through the tree
        for (let b of bodies) {
            b.resetForce();
            if (b.in(q)) {
                this.bhtree.updateForce(b);
            }
            b.updatePos(sec);
        }
        return bodies;
    }
}