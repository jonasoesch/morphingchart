import * as d3 from "d3"
import {Drawable} from "./Drawable"
import {ChangingeChartDefinition, ChangingCharacterDefinition, ChangingAxisDefinition} from "./Definitions"
import {Chart} from "./Chart"
import {Character} from "./Character"
import {Axis} from "./Axis"
import {ChangingCharacter} from "./ChangingCharacter"
import {ChangingAxis} from "./ChangingAxis"
import {Design} from "./Design"
import {valOrDefault, throwIfNotSet} from "./Helpers"



export abstract class ChangingChart implements Drawable {
    name:string
    from:Chart
    to:Chart
    design:Design 
    stage:d3.Selection<any, any, any, any>
    position:number = 0
    initialCoordinates:{top:number, left:number}


    constructor(chartDef:ChangingeChartDefinition) {
        this.name = throwIfNotSet(chartDef.name, "No name for MorphinChart")
        this.to = throwIfNotSet(chartDef.to, `Target chart not defined for ${this.name}`) 
        this.from = throwIfNotSet(chartDef.from, `Origin chart not defined for ${this.name}`)
        this.design = valOrDefault(chartDef.design, this.from.design)
        this.initStage()
    }


    /** Adds an SVG with the right dimensions
     * into the containing element
     **/
    protected initStage() {
        this.insertChart()
        this.setDimensions()
        this.setInitialCoordinates()
    }


    // TODO: Make dimensions morphable
    private setDimensions() {
        this.stage
            .attr("width", this.from.width)
            .attr("height", this.from.height)
    }


    private setInitialCoordinates() {
	    let rect = this.stage.node().getBoundingClientRect()
        this.initialCoordinates = {
            left: rect.left,
            top: rect.top
        }
    }


    private insertChart() {
        this.stage = d3.select(this.container)
            .append("svg")
            .attr("id", `${this.name}-stage`)
    }


    get container():HTMLElement {
        if(document.getElementById(this.name)) {
            return document.getElementById(this.name)
        } else {
            console.log(`HTML element for ${this.name}-Chart was added automatically.`)
            return d3.select("body")
                .append("section")
                .attr("id", this.name)
                .attr("class", "changing Chart")
                .node()

        }
    }


    getCharacter(chart:Chart, name:string):Character {
        return chart.characters.get(name)  
    }

    getAxis(chart:Chart, name:string):Axis {
        return chart.axes.get(name) 
    }


    characterStage():d3.Selection<any, any, any, any> {
        return this.stage.append("g")
            .attr("transform", `translate(${this.design.margin.left}, ${this.design.margin.top})`)
    }

    axisStage():d3.Selection<any, any, any, any> {
        return this.stage.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${this.design.margin.left}, ${this.design.margin.top})`)
    }

    atPosition(position:number) {
        this.position = position 
        return this
    }


    abstract draw():void


    drawCharacters() {
        this.draw() 
    }


    drawScene() {}

    hide() {
        this.stage.selectAll("g *").remove()
    } 
    hideCharacters(){}
    hideScene(){}


    unhide() {
    }


    get coordinates():{left:number, top:number} {
        return {
            top: d3.interpolate(this.from.coordinates.top, this.to.coordinates.top)(this.position) - this.initialCoordinates.top,
            left: d3.interpolate(this.from.coordinates.left, this.to.coordinates.left)(this.position) - this.initialCoordinates.left,
        }     
    }

}
