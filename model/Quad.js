export class Quad {

    constructor(xmid, ymid, length) {
        this.xmid = xmid;
        this.ymid = ymid;
        this.length = length;
    }

    //Check if the current quadrant contains a point
    contains(xmid, ymid) {
        return (xmid <= this.xmid + this.length / 2.0 && 
            xmid >= this.xmid - this.length / 2.0 && 
            ymid <= this.ymid + this.length / 2.0 && 
            ymid >= this.ymid - this.length / 2.0)
    }

    //Create subdivisions of the current quadrant

    // Subdivision: Northwest quadrant
    NW() {
        return new Quad(this.xmid - this.length / 4.0, this.ymid + this.length / 4.0, this.length / 2.0);
    }

    // Subdivision: Northeast quadrant
    NE() {
        return new Quad(this.xmid + this.length / 4.0, this.ymid + this.length / 4.0, this.length / 2.0);
    }

    // Subdivision: Southwest quadrant
    SW() {
        return new Quad(this.xmid - this.length / 4.0, this.ymid - this.length / 4.0, this.length / 2.0);
    }

    // Subdivision: Southeast quadrant
    SE() {
        return new Quad(this.xmid + this.length / 4.0, this.ymid - this.length / 4.0, this.length / 2.0);
    }
}