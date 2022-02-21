import { SimClock } from "./SimClock.js"
import { G, SOLAR_MASS } from "./constants.js"

export class Model {
    constructor() {
        this.bodies = []
        this.algorithm = null
        this.clock = new SimClock()
    }

    setAlgorithm(algo) {
        this.algorithm = algo;
    }

    updateSim(seconds) {
        if (!this.algorithm) {
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
            this.bodies = this.algorithm.executeUpdate(this.bodies, seconds)
        }
        this.clock.update(seconds)
    }

    circularVelocity(targetMass, distance) {
        let numerator = G * targetMass;
        return Math.sqrt(numerator / distance)
    }

    addBody(body) {
        let theta = Math.atan2(body.p[1], body.p[0])
        
        var targetMass, targetPos;
        if (this.bodies.length > 0) {
            let largest = this.bodies.reduce(function(prev, current) {
                return current.mass > prev.mass ? current : prev
            });
            targetPos = largest.p
            targetMass = largest.mass
        } else { // ... no bodies so just add it to the list
            this.bodies.push(body);
            return;
        }

        const dx = body.p[0] - targetPos[0]
        const dy = body.p[1] - targetPos[1]
        const distance = Math.sqrt(dx * dx + dy * dy)

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