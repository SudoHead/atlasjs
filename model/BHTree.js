import { Quad } from "./Quad.js";
import { Body } from "./Body.js";

export class BHTree {
    
    //Create and initialize a new bhtree. Initially, all nodes are null and will be filled by recursion
    //Each BHTree represents a quadrant and a body that represents all bodies inside the quadrant
    constructor(quad) {
        this.quad = quad;
        this.body = null;
        this.NW = null;
        this.NE = null;
        this.SW = null;
        this.SE = null;
    }

    //If all nodes of the BHTree are null, then the quadrant represents a single body and it is "external"
    isExternal(tree) {
        return (tree.NW == null && tree.NE == null && tree.SW == null && tree.SE == null);
    }

    //We have to populate the tree with bodies. We start at the current tree and recursively travel through the branches
    insert(b) {
        //If there's not a body there already, put the body there.
        if (this.body == null) {
            this.body = b;
            return;
        }
        //If the node is external and contains another body, create BHTrees
        //where the bodies should go, update the node, and end
        //(do not do anything recursively)
        if (this.isExternal(this)) {
            let c = this.body;
            let northwest = this.quad.NW();
            if (c.in(northwest)) {
                if (this.NW == null) {
                    this.NW = new BHTree(northwest);
                }
                this.NW.insert(c);
            } else {
                let northeast = this.quad.NE();
                if (c.in(northeast)) {
                    if (this.NE == null) {
                        this.NE = new BHTree(northeast);
                    }
                    this.NE.insert(c);
                } else {
                    let southeast = this.quad.SE();
                    if (c.in(southeast)) {
                        if (this.SE == null) {
                            this.SE = new BHTree(southeast);
                        }
                        this.SE.insert(c);
                    } else {
                        let southwest = this.quad.SW();
                        if (this.SW == null) {
                            this.SW = new BHTree(southwest);
                        }
                        this.SW.insert(c);
                    }
                }
            }
            this.insert(b);
        }
        //If there's already a body there, but it's not an external node
        //combine the two bodies and figure out which quadrant of the
        //tree it should be located in. Then recursively update the nodes below it.
        else {
            this.body = b.add(this.body);

            let northwest = this.quad.NW();
            if (b.in(northwest)) {
                if (this.NW == null) {
                    this.NW = new BHTree(northwest);
                }
                this.NW.insert(b);
            } else {
                let northeast = this.quad.NE();
                if (b.in(northeast)) {
                    if (this.NE == null) {
                        this.NE = new BHTree(northeast);
                    }
                    this.NE.insert(b);
                } else {
                    let southeast = this.quad.SE();
                    if (b.in(southeast)) {
                        if (this.SE == null) {
                            this.SE = new BHTree(southeast);
                        }
                        this.SE.insert(b);
                    } else {
                        let southwest = this.quad.SW();
                        if (this.SW == null) {
                            this.SW = new BHTree(southwest);
                        }
                        this.SW.insert(b);
                    }
                }
            }
        }
    }

    //Start at the main node of the tree. Then, recursively go each branch
    //Until either we reach an external node or we reach a node that is sufficiently
    //far away that the external nodes would not matter much.
    updateForce(b) {
        if (this.isExternal(this)) {
            if (this.body != b) b.addForce(this.body);
        } else if (this.quad.length / (this.body.distanceTo(b)) < 2) {
            b.addForce(this.body);
        } else {
            if (this.NW != null) this.NW.updateForce(b);
            if (this.SW != null) this.SW.updateForce(b);
            if (this.SE != null) this.SE.updateForce(b);
            if (this.NE != null) this.NE.updateForce(b);
        }
    }

    // convert to string representation for output
    toString() {
        if (this.NE != null || this.NW != null || this.SW != null || this.SE != null) 
            return "*" + this.body + "\n" + this.NW + this.NE + this.SW + this.SE;
        else 
            return " " + this.body + "\n";
    }
}