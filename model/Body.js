import {AU, G} from "./constants.js"
import { Quad } from "./Quad.js";

export class Body {
    constructor(type, image, name, mass, r, p, v, f) {
        this.type = type 
        this.image = image
        this.name = name
        this.p = p
        this.v = v
        this.f = f
        this.mass = mass
        this.r = r
    }

    add(b) {
        if (!b) return this;
        let sumMass = this.mass + b.mass;
        let centerMassX = (this.p[0] * this.mass + b.p[0] * b.mass) / (sumMass);
        let centerMassY = (this.p[1] * this.mass + b.p[1] * b.mass) / (sumMass);
        return new Body(this.type, this.image, "combined", sumMass, this.r, [centerMassX, centerMassY], [0, 0], [0, 0]);
    }

    addForce(b) {
        const EPS = 1 // softening parameter (just to avoid infinities)
        const dx = b.p[0] - this.p[0]
        const dy = b.p[1] - this.p[1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        const f = (G * this.mass * b.mass) / (dist * dist + EPS)
        this.f[0] += f * dx / dist
        this.f[1] += f * dy / dist
    }

    resetForce() {
        this.f = [0, 0]
    }

    updatePos(timestamp) {
        this.v[0] += timestamp * this.f[0] / this.mass
        this.v[1] += timestamp * this.f[1] / this.mass
        this.p[0] += timestamp * this.v[0]
        this.p[1] += timestamp * this.v[1]
    }

    distanceTo(b) {
        let dx = this.p[0] - b.p[0]
        let dy = this.p[1] - b.p[1]
        return Math.sqrt(dx * dx + dy * dy)
    }

    getTotalVelocity() {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1])
    }

    setTotalVelocity(vt) {
        if (vt < 0) {
            return ;
        }
        let change = vt / this.getTotalVelocity()
        v[0] *= change
        v[1] *= change
    }

    in(quad) {
        return quad.contains(this.p[0], this.p[1]);
    }

    toString() {
        return this.name + " pos (AU) = " + Math.round(this.p[0] / AU, 2) + 
            ", " + Math.round(this.p[1] / AU, 2);
    }
}