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
        this.n = 0;
        this.level = 0;
        this.rec_limit = 1000;
    }

    //If all nodes of the BHTree are null, then the quadrant represents a single body and it is "external"
    isExternal(tree) {
        return (tree.NW === null && tree.NE === null && tree.SW === null && tree.SE === null);
    }

    _insert(b) {
        let nw = this.quad.NW();
        let ne = this.quad.NE();
        let se = this.quad.SE();
        let sw = this.quad.SW();
        if (b.in(nw)) {
            // console.log("body: " + b.p[0] + b.p[1] + " in NW: " + nw + " n: " + this.n + " lvl: " + (this.level + 1))
            if (!this.NW) this.NW = new BHTree(nw);
            this.NW.level = this.level + 1;
            if (this.NW.level > this.rec_limit) this.NW.body = b.add(this.NW.body);
            else this.NW.insert(b);
        }
        else if (b.in(ne)) {
            // console.log("body: " + b.p[0] + b.p[1] + " in NE: " + ne + " n: " + this.n + " lvl: " + (this.level + 1))
            if (!this.NE) this.NE = new BHTree(ne);
            this.NE.level = this.level + 1;
            if (this.NE.level > this.rec_limit) this.NE.body = b.add(this.NE.body);
            else this.NE.insert(b);
        }
        else if (b.in(se)) {
            // console.log("body: " + b.p[0] + b.p[1] + " in SE: " + se + " n: " + this.n + " lvl: " + (this.level + 1))
            if (!this.SE) this.SE = new BHTree(se);
            this.SE.level = this.level + 1;
            if (this.SE.level > this.rec_limit) this.SE.body = b.add(this.SE.body);
            else this.SE.insert(b);
        }
        else if (b.in(sw)) {
            // console.log("body: " + b.p[0] + b.p[1] + " in SW: " + sw + " n: " + this.n + " lvl: " + (this.level + 1))
            if (!this.SW) this.SW = new BHTree(sw);
            if (this.SW.level > this.rec_limit) this.SW.body = b.add(this.SW.body);
            else this.SW.insert(b);
        }
    }

    //We have to populate the tree with bodies. We start at the current tree and recursively travel through the branches
    insert(b) {
        if (this.body === null){
            this.body = b;
        }
        else if (!this.isExternal(this)) {
            this.body = b.add(this.body);
            this._insert(b);
        } else if (this.isExternal(this)) {
            this._insert(this.body);
            this.insert(b);
        }
        this.n += 1;
    }

    //Start at the main node of the tree. Then, recursively go each branch
    //Until either we reach an external node or we reach a node that is sufficiently
    //far away that the external nodes would not matter much.
    updateForce(b) {
        if (this.isExternal(this)) {
            if (this.body != b) b.addForce(this.body);
        } else if (this.quad.length / (this.body.distanceTo(b)) < 2 || this.level > 2000) {
            b.addForce(this.body);
        } else {
            if (this.NW != null) this.NW.updateForce(b);
            if (this.SW != null) this.SW.updateForce(b);
            if (this.SE != null) this.SE.updateForce(b);
            if (this.NE != null) this.NE.updateForce(b);
        }
    }

    nodeList() {
        if (!this.quad) return [];
        let quads = [this];
        if (this.NW) quads = quads.concat(this.NW.nodeList());
        if (this.SW) quads = quads.concat(this.SW.nodeList());
        if (this.SE) quads = quads.concat(this.SE.nodeList());
        if (this.NE) quads = quads.concat(this.NE.nodeList());
        return quads;
    }

    // convert to string representation for output
    toString() {
        if (this.NE != null || this.NW != null || this.SW != null || this.SE != null) 
            return "*" + this.body + "\n" + this.NW + this.NE + this.SW + this.SE;
        else 
            return " " + this.body + "\n";
    }
}