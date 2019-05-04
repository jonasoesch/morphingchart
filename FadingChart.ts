import * as d3 from "d3"
import {Drawable} from "./Drawable"
import {FadingChartDefinition} from "./Definitions"
import {Chart} from "./Chart"
import { throwIfNotSet} from "./Helpers"


export class FadingChart implements Drawable {
    name:string
    from:Chart
    to:Chart
    stage:d3.Selection<any, any, any, any>
    position:number = 0

    constructor(chartDef:FadingChartDefinition) {
        this.name = throwIfNotSet(chartDef.name, "No name for Fading Chart")
        this.to = throwIfNotSet(chartDef.to, `Target chart not defined for ${this.name}`) 
        this.from = throwIfNotSet(chartDef.from, `Origin chart not defined for ${this.name}`)
        this.initStage()
    }

    atPosition(position:number) {
        this.position = position 
        return this
    }


    get container():HTMLElement {
        if(document.getElementById(this.name)) {
            return document.getElementById(this.name)
        } else {
            console.log(`HTML element for ${this.name}-Chart was added automatically.`)
            return d3.select("body")
                .append("section")
                .attr("id", this.name)
                .attr("class", "Chart")
                .node()

        }
    }


    private initStage() {
        this.insertChart()
        this.setDimensions()
    }



    private insertChart() {
        this.stage = d3.select(this.container)
            .append("svg")
            .attr("id", `${this.name}-stage`)
    }

    private setDimensions() {
        this.stage
            .attr("width", this.to.width)
            .attr("height", this.to.width)
    }

    draw() {
        this.from.characters.forEach(c => {
            this.stage.append("path")
                .attr("d", c.path)
                .attr("fill", c.color)
        })
        this.to.characters.forEach(c => {
            this.stage.append("path")
                .attr("d", c.path)
                .attr("fill", c.color)
        })
    }

    drawCharacters() {
        this.draw()
    }

    drawScene() {}

    hide() {
    } 
    hideScene(){}
    hideCharacters(){}

    unhide() {
    }

}
