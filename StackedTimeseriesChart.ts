import * as d3 from "d3"
import {Chart} from "./Chart"
import {Axis} from "./Axis"
import {Character} from "./Character"
import {Annotation} from "./Annotation"
import {AxisDefinition, CharacterDefinition, ChartDefinition} from "./Definitions"
import {throwIfNotSet, valOrDefault, throwIfEmpty, buildMapWithName} from "./Helpers"


export class StackedTimeseriesChart extends Chart {

    buildAxis(axis:AxisDefinition):StackedTimeseriesAxis {
        let s = this.axisStage(axis.name)
        return new StackedTimeseriesAxis(axis, s, this.innerWidth, this.innerHeight, this.design)
    }


    buildCharacter(chara:CharacterDefinition):StackedTimeseriesCharacter {
        let stage = this.characterStage(throwIfNotSet(chara.name, "Character has no name"))
        let data = this.data.filter( (d:any) => d[chara.field] === chara.name ) 

        throwIfEmpty(data, `There is no data for character ${chara.name}`)
        let character =  new StackedTimeseriesCharacter(chara, stage, data, this.axes.get("y"), this.axes.get("x"))
        return character
    }

    buildChart(def:ChartDefinition) {
        super.buildChart(def) 
        this.updateData()
    }


    private updateData() {
        let previousCharacter:any = null
        let x = this.axes.get("x").field
        let y = this.axes.get("y").field
        this.characters.forEach(c => {
            c.data.forEach((d2:any) => {
                d2["min"] = this.characterMaxOrZero(previousCharacter, 
                    (d1:any) =>  {return this.unwrap(d1[x]) === this.unwrap(d2[x])}, c)
                d2["max"] = this.characterMaxOrZero(previousCharacter, 
                    (d1:any) => {return this.unwrap(d1[x]) === this.unwrap(d2[x])}, c) + d2[y]
            })
            previousCharacter = c
        })
    }

    unwrap(d:any) {
        if(d instanceof Date)  {
            return d.getTime() 
        } else {
            return d 
        }
    }

    private characterMaxOrZero(c:any, accessor:Function, c2:any):number {
        if(c === null) {return 0}
        if("data" in c) {
            return c.data.filter(accessor)[0]["max"]
        }
    }


}

class StackedTimeseriesAxis extends Axis {
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


    getAxis(scale:any, ticks?:any[]):d3.Axis<any> {
        let axis:d3.Axis<any>
        if(this.name === "y") {axis = d3.axisLeft(scale).tickArguments([6]);}
        if(this.name === "x") {axis = d3.axisBottom(scale).tickArguments([6]);}
        if(ticks) {axis.tickValues(ticks)}
        return axis
    }

    draw() {
        this.axis = this.getAxis(this.scale, this.ticks)
        this.stage.selectAll("*").remove()
        this.stage
            .attr("class", "axis")
            .call(throwIfNotSet(this.axis, "Axis name needs to be either 'x' or 'y'"))

       this.stage.attr("transform", this.translate()) 



        if(this.name === "x") {
            this.stage.selectAll(".tick line")
                .attr("y2", this.height*-1)
                .attr("stroke-width", 2)
        }

        this.drawAnnotations()
    }


    translate() {
        if(this.name === "x") {
            return `translate(0, ${this.height})` 
        } else {
            return `translate(0,0)` 
        }
    }


    drawAnnotation(annotation:any) {
        this.stage
            .append("text")
            .attr("class", "axis-label")
            .text(annotation.name)
            .attr("text-anchor", "start")
            .attr("x", annotation.offset.left)
            .attr("y", annotation.offset.top)
            .attr("fill", this.design.font.color)
            .attr("font-family", this.design.font.family)
    }


}


class StackedTimeseriesCharacter extends Character {
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
            .y0((d:any) => this.yScale(d["max"]))
            .y1((d:any) => this.yScale(d["min"]))
    }

    protected annotationY(annotation:Annotation):number {
        let pos = this.annotationPosition(annotation.anchor)
        return this.yScale(this.data[pos]["max"]) + 10 + annotation.offset.top
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
