import { Model } from "../model/Model.js";
import { Body } from "../model/Body.js";
import { SimClock } from "../model/SimClock.js";
import { SOLAR_MASS } from "../model/constants.js";

let b1 = new Body('planet', '', 'sun', SOLAR_MASS, [0, 0], [0, 0], [0, 0])

let b2 = new Body('planet', '', 'earth', SOLAR_MASS / 1000, [1, 1], [0, 0], [0, 0])

console.log(b1.name + " \tpos:\t" + b1.p)
console.log(b2.name + " \tpos:\t" + b2.p)

let model = new Model()

model.addBody(b1)
model.addBody(b2)

model.updateSim(10000)

console.log(b1.name + " \tpos:\t" + b1.p)
console.log(b2.name + " \tpos:\t" + b2.p)

model.updateSim(10000)

console.log(b1.name + " \tpos:\t" + b1.p)
console.log(b2.name + " \tpos:\t" + b2.p)