import { Model } from "../model/Model.js";
import { Body } from "../model/Body.js";
import { SimClock } from "../model/SimClock.js";
import { AU, EARTH_MASS, PLUTO_MASS, SOLAR_MASS } from "../model/constants.js";
import { getWidth, getHeight } from "./global.js";
import { BarnesHut } from "../model/BarnesHut.js";
import { Quad } from "../model/Quad.js";
import { BHTree } from "../model/BHTree.js";

const width = getWidth(), height = getHeight();

let model = new Model()

let barnesHut = new BarnesHut()
model.setAlgorithm(barnesHut)

// TODO: scale to zoom + mouse scroll event handler
var scale = 1 / (AU * 10)

const solar_system_data = await fetch('https://raw.githubusercontent.com/SudoHead/atlasjs/main/data.json')
.then(response => response.json())
.catch(error => console.log(error));

let sun = solar_system_data[0]

// let bodies = []

// const extract_bodies = (b) => {
//     bodies.push(b);
//     if (b.satellites) {
//         b.satellites.forEach(element => {
//             extract_bodies(element)
//         });
//     }
// };

// extract_bodies(sun)

// bodies.forEach(b => {
//     let dist = b.distance * AU,
//         mass = b.mass * SOLAR_MASS;
//     model.addBody(new Body('', '', b.name, mass, b.r, [dist, dist], [0, 0], [0, 0]));
// });
model.spawnSpiralGalaxy(-4000 * AU, 0, AU * 4000, 2047, 4);
model.spawnSpiralGalaxy(4000 * AU, 4000 * AU, AU * 4000, 2047, 5, [-AU/10000, -AU/10000]);

let vis = d3.select("#sim-area")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

function color() {
    return '#'+(((Math.random()*0.9)+0.1)*0xFFFFFF<<0).toString(16)
}

function toScreenXY(p) {
    return [p[0] * scale + width / 2, p[1] * scale + height / 2];
}

function scaleRadius(b) {
    return Math.min(Math.max(10 * (b.mass/SOLAR_MASS), 2), 30);
}

function click() {
    let coords = d3.mouse(d3.event.target);
    
    let newData= [
        Math.round( (coords[0] - width/2) / scale),
        Math.round( (coords[1] - height/2) / scale)
    ]

    model.addBody(new Body('', '', 'body' + Math.round(performance.now()), 
    EARTH_MASS, sun.r/100, newData, [0,0], [0,0]));
}

// Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity

    // Use D3 to select element, change color and size
    d3.select(this)
        .attr("fill", "orange")
        .attr("r", scaleRadius(d) * 2)

    // Specify where to put label of text
    vis.append("text")
        .attr("id", d.name)
        .attr("x", () => toScreenXY(d.p)[0] - 30)
        .attr("y", () => toScreenXY(d.p)[1] - 15)
        .attr("fill", "white")
        .text(() => d.name)
}

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
        .attr("fill", color())
        .attr("r", scaleRadius(d))

    // Select text by id and then remove
    d3.select("#" + d.name).remove();  // Remove text location
}

var keepAdding = false;
const addInterval = 10;
let lastAdded = performance.now();
function continuosClick() {
    let now = performance.now();
    if (keepAdding && now - lastAdded > addInterval) {
        lastAdded = now;
        click();
    }
}

vis.on("mousedown", () => { keepAdding = true })
    .on("mouseup", () => { keepAdding = false })
    .on("mousemove", continuosClick)
    .on("click", click)

function update(model) {
    let select = vis.selectAll("circle")
        .data(model.bodies, (b) => { return b.name; })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)

    // TODO: fix wonky radius r 
    select.enter()
        .append("circle")
        .attr("cx",     (b) => toScreenXY(b.p)[0])
        .attr("cy",     (b) => toScreenXY(b.p)[1])
        .attr("r",      (b) => scaleRadius(b))
        .attr("fill",   (b) => color())

    select
        .attr("cx", (b) => toScreenXY(b.p)[0])
        .attr("cy", (b) => toScreenXY(b.p)[1]);
        

    select.exit()
        .remove();
}

function drawTree(quads) {
    let select = vis.selectAll("rect")
        .data(quads)

    select.enter()
        .append("rect")
        .attr("x",     (q) => { return (q.xmid - q.length/2) * scale + width / 2; })
        .attr("y",     (q) => { return (q.ymid - q.length/2) * scale + height / 2; })
        .attr("width", (q) => { return q.length * scale; })
        .attr("height", (q) => { return q.length * scale; })
        .style("stroke-opacity", 0.2) 
        .style("stroke", "green")
        .style("fill", "none")
        // .attr("opacity", 0.9)
        // .attr("fill", "none")

    select
        .attr("x",     (q) => { return (q.xmid - q.length/2) * scale + width / 2; })
        .attr("y",     (q) => { return (q.ymid - q.length/2) * scale + height / 2; })

    select.exit()
        .remove();
}

function drawQuadTree(model) {
    if (!document.getElementById("showtree").checked) {
        vis.selectAll("rect").remove()
        return;
    }

    let q = new Quad(0, 0, AU * 100000);
    let tree = new BHTree(q);
    // If the body is still on the screen, add it to the tree
    let n = 0;
    for (let b of model.bodies) {
        if (b.in(q)) tree.insert(b);
        // drawTree(tree.nodeList().map(q => q.quad));
    }
    // console.warn(tree.nodeList().filter(q => q.n >= 1))
    // const quads = model.bodies.map((b) => { return new Quad(b.p[0], b.p[1], AU); })
    // let quads = [q, q.NE(), q.NW(), q.SE(), q.SW()];

    drawTree(tree.nodeList().map(q => q.quad))
}

// TODO: inputs to control speed
let dt = 33.333;
let btnPlay = document.getElementById("play"),
    loop,
    running = false;

function step () {
    if (!running) return;

    let _start = performance.now();
    model.updateSim(dt * 86400 / 50);
    let t = 1000 / (performance.now() - _start);
    let runtimeInfo = document.getElementById("runtime");
    runtimeInfo.innerText = "Max iterations/s: " + Math.round(t);
    let body = document.getElementById("n-body");
    body.innerText = model.bodies.length + "-body simulation";
    update(model);
    drawQuadTree(model);
    window.requestAnimationFrame(step)
}

window.requestAnimationFrame(step)
function playStop () {
    if (running) {
        running = false;
        btnPlay.innerText = "Play";
        return;
    }
    btnPlay.innerText = "Stop"
    running = true;
    window.requestAnimationFrame(step)
}

// playStop()
btnPlay.addEventListener("click", playStop)