import { SimClock } from "./SimClock.js"
import { G, SOLAR_MASS } from "./constants.js"

export class Model {
    constructor() {
        this.bodies = []
        this.algorithm = null
        this.clock = new SimClock()
    }

    updateSim(seconds) {
        if (this.algorithm == null) {
            let copy = this.bodies.slice()
            for (let b of this.bodies) {
                b.resetForce()
                for (const c of copy) {
                    if (c !== b) {
                        b.addForce(c)
                    }
                }
                b.updatePos(seconds)
            }
        } else {
            this.bodies = this.algorithm.executeUpdate(bodies, seconds)
        }
        this.clock.update(seconds)
    }

    circularVelocity(targetMass, distance) {
        let numerator = G * targetMass;
        return Math.sqrt(numerator / distance)
    }

    addBody(body) {
        let theta = Math.atan2(body.p[1], body.p[0])

        let targetMass = Math.max(this.bodies.map((b) => b.mass), SOLAR_MASS)
        let distance = 100000000

        let totVel = this.circularVelocity(targetMass, distance)

        let anglev = totVel / distance

        let vx = -distance * anglev * Math.sin(theta)
        let vy = distance * anglev * Math.cos(theta)

        body.v = [vx, vy]
        this.bodies.push(body)
    }

    getTime() {
        return this.clock
    }
}