import * as d3 from "d3"
import {Chart} from "./Chart"
import {Axis} from "./Axis"
import {Character} from "./Character"
import {Annotation} from "./Annotation"
import {AxisDefinition, CharacterDefinition, ChartDefinition} from "./Definitions"
import {throwIfNotSet, valOrDefault, throwIfEmpty, buildMapWithName} from "./Helpers"


export class TimeseriesChart extends Chart {

    buildAxis(axis:AxisDefinition):TimeseriesAxis {
        let s = this.axisStage(axis.name)
        return new TimeseriesAxis(axis, s, this.innerWidth, this.innerHeight, this.design)
    }

    buildCharacter(chara:CharacterDefinition):TimeseriesCharacter {
        let stage = this.characterStage(throwIfNotSet(chara.name, "Character has no name"))
        let data = this.data.filter( (d:any) => d[chara.field] === chara.name ) 

        throwIfEmpty(data, `There is no data for character ${chara.name}`)
        let character =  new TimeseriesCharacter(chara, stage, data, this.axes.get("y"), this.axes.get("x"))
        return character
    }

    buildChart(def:ChartDefinition) {
        super.buildChart(def) 
    }

}

class TimeseriesAxis extends Axis {
    defineScale(domain:(number[]|string[]|Date[])) {
        if(this.name === "y") {
            return d3.scaleLinear()
                .domain((domain as number[]).reverse())
                .range([0, this.height])
        }
        if(this.name === "x") {
            return d3.scaleTime()
                .domain((domain as Date[]))
                .range([0, this.width])
        }
    }

    translate() {
        if(this.name === "x") {
            return `translate(0, ${this.height})` 
        } else {
            return `translate(0,0)` 
        }
    }

    getAxis(scale:any, ticks?:any) {
        let axis:d3.Axis<any>
        if(this.name === "y") {axis = d3.axisLeft(scale).tickArguments([6]);}
        if(this.name === "x") {axis = d3.axisBottom(scale).tickArguments([6]);}
        if(ticks) {axis.tickValues(ticks)}
        return axis
    }

    draw() {
        let axis = this.getAxis(this.scale, this.ticks)
        this.stage.selectAll("*").remove()
        this.stage
            .attr("class", "axis")
            .call(throwIfNotSet(axis, "Axis name needs to be either 'x' or 'y'"))

        if(this.name === "x") {
            this.stage.attr("transform", `translate(0, ${this.height})`) 
        }

        if(this.name === "y") {
            this.stage.selectAll(".tick line")
                .attr("x2", this.width)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
        }


        if(this.name === "x") {
            this.stage.selectAll(".tick line")
                .attr("y2", this.height*-1)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
        }


        this.drawAnnotations()

    }

    drawAnnotation(annotation:any) {
        this.stage
            .append("text")
            .attr("class", "axis-label")
            .text(annotation.name)
            .attr("text-anchor", "start")
            .attr("x", annotation.offset.left - 40)
            .attr("y", annotation.offset.top-40)
            .attr("fill", this.design.font.color)
            .attr("font-family", this.design.font.family)
    }


}


class TimeseriesCharacter extends Character {
    yScale:any
    y:string
    xScale:any
    x:string
    data:any

    constructor(charDef:CharacterDefinition,
        stage:d3.Selection<any, any, any, any>,
        data:object[],
        yAxis:any,
        xAxis:any) 
    {
        super(charDef, data, stage)
        this.yScale = yAxis.scale
        this.y = yAxis.field
        this.xScale = xAxis.scale
        this.x = xAxis.field
        this.data = throwIfEmpty(data, `There is no data for character ${this.name}`)
        this.field = charDef.field
    }

    draw() {
        this.stage.selectAll("*").remove()
        this.stage
            .append("path")
            .attr("d", this.path)
            .attr("fill", this.color)
            .attr("stroke", this.color)


        this.drawAnnotations()
    }

    drawAnnotation(annotation:any) {
        this.stage
            .append("text")
            .text(annotation.name)
            .attr("fill", this.color)
            .attr("class", annotation.class)
            .attr("y", this.annotationY(annotation))
            .attr("x",this.annotationX(annotation))
    }


    pathGenerator() {
        return d3.area()
            .x((d:any, i:number) => this.xScale(d[this.x]))
            .y1((d:any) => this.yScale(d[this.y]))
            .y0((d:any) => this.yScale(d[this.y])-3)
    }

    protected annotationY(annotation:Annotation):number {
        let pos = this.annotationPosition(annotation.anchor)
        return this.yScale(this.data[pos][this.y]) + 5 + annotation.offset.top
    }

    protected annotationX(annotation:Annotation):number {
        let pos = this.annotationPosition(annotation.anchor)
        return this.xScale(this.data[pos][this.x]) + 5 + annotation.offset.left
    }

    protected annotationPosition(pos:(string|number)):number {
        if(pos === "start") {pos = 0}
        if(pos === "end") {pos = this.data.length -1}
        if(typeof(pos) === "string") {pos = 0} // Users mistake
        return pos
    }




}

