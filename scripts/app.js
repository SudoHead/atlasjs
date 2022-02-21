import { Model } from "../model/Model.js";
import { Body } from "../model/Body.js";
import { SimClock } from "../model/SimClock.js";
import { AU, PLUTO_MASS, SOLAR_MASS } from "../model/constants.js";
import { BarnesHut } from "../model/BarnesHut.js";

const width = window.innerWidth, height = window.innerHeight;

let model = new Model()

let barnesHut = new BarnesHut()
model.setAlgorithm(barnesHut)

// TODO: scale to zoom + mouse scroll event handler
var scale = 1 / (AU/200)

const solar_system_data = await fetch('../data.json')
.then(response => response.json())
.catch(error => console.log(error));

let sun = solar_system_data[0]
// sun = new Body('star', '', sun.name, sun.m,  [0, 0], [0, 0], [0, 0])

let bodies = []

const extract_bodies = (b) => {
    bodies.push(b);
    if (b.satellites) {
        b.satellites.forEach(element => {
            extract_bodies(element)
        });
    }
};

extract_bodies(sun)

bodies.forEach(b => {
    let dist = b.distance * AU,
        mass = b.mass * SOLAR_MASS;
    model.addBody(new Body('', '', b.name, mass, b.r, [dist, dist], [0, 0], [0, 0]));
});

console.log(model)

let vis = d3.select("div")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

function color() {
    return '#'+(((Math.random()*0.9)+0.1)*0xFFFFFF<<0).toString(16)
}

function update(model) {
    let select = vis.selectAll("circle")
        .data(model.bodies, (b) => { return b.name; })

    // TODO: fix wonky radius r 
    select.enter()
        .append("circle")
        .attr("cx",     (b) => { return b.p[0] * scale + width / 2; })
        .attr("cy",     (b) => { return b.p[1] * scale + height / 2; })
        .attr("r",      (b) => { return Math.max(b.r * 10_000, 10); })
        .attr("fill",   (b) => { return color(); })
        // .filter(function(b) { return b.r > 12.0;})
        .attr("r", 0)
        .transition()
        .duration(300)
        .attr("r", (b) => { return Math.max(b.r * 10_000, 10); });

    select
        .attr("cx", (b) => { return b.p[0] * scale + width / 2; })
        .attr("cy", (b) => { return b.p[1] * scale + height / 2; });

    select.exit()
        .remove();
}

// TODO: inputs to control speed
let dt = 20;
let btnPlay = document.getElementById("play"),
    btnStop = document.getElementById("pause"),
    loop,
    running = false;

function play () {
    if (running) return;
    running = true;
    loop = setInterval(function() {
        console.time("updateSim()")
        model.updateSim(dt * 86400 / 5);
        console.timeEnd("updateSim()")
        update(model);
    }, dt)
}

play()
btnPlay.addEventListener("click", play)
btnStop.addEventListener("click", () => { clearInterval(loop); running = false; })