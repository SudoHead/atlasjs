import { SimClock } from "./SimClock.js"
import { G, SOLAR_MASS, AU, EARTH_MASS } from "./constants.js"
import { Body } from "./Body.js"

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
        console.log("Adding: " + body)
        let theta = Math.atan2(body.p[1], body.p[0])
        
        var targetMass = 0, targetPos;
        if (this.bodies.length > 0) {
            let largest = this.bodies.reduce(function(prev, current) {
                return current.mass > prev.mass ? current : prev
            });
            targetPos = largest.p
            targetMass = largest.mass
        }
        if (targetMass < body.mass) {
            this.bodies.push(body)
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

    spawnSpiralGalaxy(x, y, r, n, coils, v = [0, 0]) {
        // Adding a black hole at the center
        this.bodies.push(new Body('blackhole', '', 'GalaxyBlackHole', SOLAR_MASS * 10000000000, 1 * AU, [x, y], v, [0, 0]))

        let theta = 0;
        let radius = (r / n) * 400;

        // For every side, step around and away from center.
        for(var i=1; i <= n ; i++){
            radius += r / n;
            theta += (Math.PI * 2) / (n / coils);
        
            // Convert 'around' and 'away' to X and Y.
            var px = x + Math.cos(theta) * radius + Math.random() * (r / n) * 200;
            var py = y + Math.sin(theta) * radius + Math.random() * (r / n) * 150;
            
            this.addBody(new Body('star', '', 'star_' + i, SOLAR_MASS / 100, 1, [px, py], [0, 0], [0, 0]))
        }
    }

    getTime() {
        return this.clock
    }
}