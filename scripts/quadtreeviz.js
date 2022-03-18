import { Quad } from "../model/Quad.js";
import { BHTree } from "../model/BHTree.js"; 
import { Body } from "../model/Body.js";
import { getWidth, getHeight } from "./global.js";

const width = getWidth(), height = getHeight();

let scale = 1;
const radius = 6;

let bodies = [];

let vis = d3.select("div")
    .append("svg:svg")
    .attr("width", width * 2)
    .attr("height", height);

vis.selectAll("circle")
    .data(bodies)
    .enter()
    .append("circle")
    .attr("cx",     (b) => { return b.p[0] * scale; })
    .attr("cy",     (b) => { return b.p[1] * scale; })
    .attr("r",      radius)
    .attr("fill",   (b) => { return color(); })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

vis.selectAll("rect")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);


function color() {
    return '#'+(((Math.random()*0.9)+0.1)*0xFFFFFF<<0).toString(16)
}

vis.on("click", function() {
    let coords = d3.mouse(this);

    // Normally we go from data to pixels, but here we're doing pixels to data
    let newData= [
        Math.round( coords[0]),  // Takes the pixel number to convert to number
        Math.round( coords[1])
    ]

    bodies.push(new Body('', '', '', 1, 1, newData, [0,0], [0,0]));   // Push data to our array

    let tree = new BHTree(new Quad(width/4 + 300,height/2, Math.min(width, height) - 100));
    for (const b of bodies) {
        tree.insert(b);
    }
    drawQuads(tree.nodeList().map((b) => b.quad));
    drawQuadsCenter(tree.nodeList().map((b) => b.quad));

    vis.selectAll("circle")  // For new circle, go through the update process
        .data(bodies)
        .enter()
        .append("circle")
        .attr("cx",     (b) => { return b.p[0] * scale; })
        .attr("cy",     (b) => { return b.p[1] * scale; })
        .attr("r",      radius)
        .attr("fill",   (b) => { return color(); })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
    })

// Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity

    // Use D3 to select element, change color and size
    d3.select(this)
        .attr("fill", "orange")
        .attr("r", radius * 2)

    // Specify where to put label of text
    vis.append("text")
        .attr("id", "t" + d.p[0] + "-" + d.p[1] + "-" + i)
        .attr("x", () => d.p[0] - 30)
        .attr("y", () => d.p[1] - 15)
        .attr("fill", "white")
        .text(() => [d.p[0], d.p[1]])
}

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this)
        .attr("fill", color())
        .attr("r", radius)

    // Select text by id and then remove
    d3.select("#t" + d.p[0] + "-" + d.p[1] + "-" + i).remove();  // Remove text location
}


function drawQuads(quads) {
    console.log("-------------")
    let select = vis.selectAll("rect")
        .data(quads)

    select.enter()
        .append("rect")
        .attr("x",     (q) => { return (q.xmid - q.length/2) * scale; })
        .attr("y",     (q) => { return (q.ymid - q.length/2) * scale; })
        .attr("width", (q) => { return q.length * scale; })
        .attr("height", (q) => { return q.length * scale; })
        .style("stroke-opacity", 1) 
        .style("stroke", "green")
        .style("fill", "none")
        // .attr("opacity", 0.9)
        // .attr("fill", "none")

    select
        .attr("x",     (q) => { return (q.xmid - q.length/2) * scale; })
        .attr("y",     (q) => { return (q.ymid - q.length/2) * scale; })

    select.exit()
        .remove();
}

var triangle = d3.symbol()
                    .type(d3.symbolTriangle)
                    .size(25)

function drawQuadsCenter(quads) {
    let select = vis.selectAll("path")
        .data(quads)

    select.enter()
        .append("path")
        .attr("d", triangle)
        .attr("stroke", "white")
        .attr("color", "white")
        .attr("transform", function(q) { return "translate(" + q.xmid + "," + q.ymid + ")"; });

    select.exit()
        .remove();
}

function drawTree(tree) {

}

// let dt = 500;
// setInterval(function() {
//     let tree = new BHTree(new Quad(width/4 + 100,height/2, Math.min(width, height) - 100));
//     for (const b of bodies) {
//         tree.insert(b);
//     }
//     drawQuads(tree.nodeList().map((b) => b.quad));
//     drawTree(tree);
// }, dt)