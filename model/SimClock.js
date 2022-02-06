export class SimClock {
    constructor(offset) {
        this.time = 0
        this.epochOffset = offset
    }

    update(dt) {
        this.time += dt * 1000
    }

    currentSimTime() {
        return this.time
    }

    resetClock() {
        this.time = 0
    }
}