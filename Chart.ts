import * as d3 from "d3"
import {Drawable} from "./Drawable"
import {Design} from "./Design"
import {Character} from './Character'
import {Axis} from "./Axis"
import {Annotation} from "./Annotation"
import {ChartDefinition, 
    AxisDefinition, 
    CastDefinition, 
    CharacterDefinition, 
    AnnotationDefinition,
    Named} from "./Definitions"
import {buildMapWithName, throwIfNotSet, valOrDefault, throwIfEmpty, overwriteDefaults} from "./Helpers"


interface Scale extends Function {
    domain:Function 
}

// Submodule test
export abstract class Chart implements Drawable {
    _name:string
    _data:any
    _stage:d3.Selection<any, any, any, any>

    _design:Design = new Design()
    _annotations:Map<string, Annotation> = new Map()
    _characters:Map<string, Character> = new Map()
    _axes:Map<string, Axis> = new Map()


    constructor(definition:ChartDefinition) {
        this.validateDefinition(definition)
        this.name = throwIfNotSet(definition.name, "There is no chart name")
        this.design = overwriteDefaults(this.design, definition.design)
        this.initStage()
        this.buildChart(definition)
    }


    validateDefinition(definition:ChartDefinition) {
        this.hasAName(definition)
        this.hasData(definition) 
        this.axesMatchData(definition)
        this.castMatchesAxes(definition)
        this.castMatchesData(definition)
        this.charactersInData(definition)
    }

    hasAName(definition:ChartDefinition) {
        throwIfNotSet(definition.name, `Chart has no name`) 
    }

    hasData(definition:ChartDefinition) {
        throwIfEmpty(definition.data, `There is no data for chart ${definition.name}`) 
    }

    axesMatchData(definition:ChartDefinition) {
        definition.axes.forEach(a => {
            if(a.hasOwnProperty("field"))  {
                if(!definition.data[0].hasOwnProperty(a.field))  {
                    throw new Error(`There is no ${a.field} field in the data provided to the ${definition.name} chart`)  
                }
            }
        }) 
    }

    castMatchesAxes(definition:ChartDefinition) {
        this.castMatchAxis(definition, "x")
        this.castMatchAxis(definition, "y")
    }

    castMatchAxis(definition:ChartDefinition, axis:"x"|"y") {
        if(definition.cast.axes.hasOwnProperty(axis)) {
            let matches = definition.axes.filter(a => {
                if(a.hasOwnProperty("name") && a.name === definition.cast.axes[axis]) {return true} 
                else {return false}
            })
            if(matches.length === 0) {
                throw new Error(`In the ${definition.name}-chart definition, an axis named "${definition.cast.axes[axis]}" is missing`)
            }
            if(matches.length > 1) {
                throw new Error(`In the ${definition.name}-chart definition, an axis named "${definition.cast.axes[axis]}" occurs more than once`) 
            }
        }
    }


    castMatchesData(definition:ChartDefinition) {
        if(!definition.data[0].hasOwnProperty(definition.cast.field)) {
            throw new Error(`In the "${definition.name}"-chart definition, the field "${definition.cast.field}" given for the characters can't be found in the data`)  
        }
    }


    charactersInData(definition:ChartDefinition) {
        definition.cast.characters.forEach(c => {
            let matches = definition.data.filter((d:any) => {
                return d[definition.cast.field] === c.name
            })
            if(matches.length === 0) {
                throw new Error(`In chart "${definition.name}", the character "${c.name} can't be found in the "${definition.cast.field}"-field in the data`) 
            }

        }) 
    }




    /** Adds an SVG with the right dimensions
     * into the containing element
     **/
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
            .attr("width", this.width)
            .attr("height", this.height)
    }


    get width() {
        return this.container ? 
            this.container.getBoundingClientRect().width : 
            1080 
    }

    get innerWidth() {
        return this.width - (this.design.margin.left + this.design.margin.right) 
    }

    get height() {
        return this.container ?
            this.container.getBoundingClientRect().height : 
            720
    }

    get innerHeight() {
        return this.height - (this.design.margin.top + this.design.margin.bottom)
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

    get coordinates():{left:number, top:number} {
	    let rect = this.stage.node().getBoundingClientRect()
	    return { 
            top: rect.top, 
            left: rect.left 
        }
    }

    buildChart(def:ChartDefinition) {
        this.data = def.data
        this.axes = this.buildAxes(def.axes)
        this.characters = this.buildCharacters(def.cast)
        this.annotations = this.buildAnnotations(def.annotations)
    }


    buildAxes(axes:AxisDefinition[]):Map<string, Axis> {
        return buildMapWithName(axes, this.buildAxis.bind(this))
    }

    axisStage(name:string):d3.Selection<any, any, any, any> {
        return this.stage.append("g")
        .attr("transform", `translate(${this.design.margin.left}, ${this.design.margin.top})`)
        .append("g")
        .attr("id", `axis-${name}`)
    }

    characterStage(name:string):d3.Selection<any, any, any, any> {
        return this.stage.append("g")
        .attr("id", `character-${name}`)
        .attr("class", `character`)
        .attr("transform", `translate(${this.design.margin.left}, ${this.design.margin.top})`) 
    }

    abstract buildAxis(axis:AxisDefinition):Axis

    buildCharacters(cast:CastDefinition) {
        let characters = cast.characters.map( (chara:CharacterDefinition) => {
            chara.axes = cast.axes
            chara.field = cast.field
            return chara
        })
        return buildMapWithName(characters, this.buildCharacter.bind(this)) 
    }

    abstract buildCharacter(charaDef:CharacterDefinition):Character

    buildAnnotations(annos:AnnotationDefinition[]) {
        return buildMapWithName(annos, this.buildAnnotation)
    }

    buildAnnotation(annoDef:AnnotationDefinition) {
        return new Annotation(annoDef)
    }


    // ========= Helper methods ==========


    draw() {
        this.removeAnnotations()
        this.drawScene()
        this.drawCharacters()
        this.unhide()
    }

    public drawScene() {
        this.removeAnnotations()
        this.drawAnnotations()
        this.axes.forEach(a => a.draw())
    }
    public drawCharacters() {
        this.characters.forEach(c => {c.draw()})
    }

    // Only the chart annotations.
    // Character annotations are handeled by the characters themselves
    protected drawAnnotations() {
        if(this.annotations) {
            this.annotations.forEach(a => this.drawAnnotation(a))
        }
    }

    // TODO: less messy here
    protected drawAnnotation(annotation:Annotation) {
        let text = this.stage.append("g") 
            .attr("class", "chart-title")
            .attr("transform", `translate(${this.design.margin.left
                    +annotation.offset.left},${this.design.margin.top /3
                    +annotation.offset.top})`)
            .append("text")
            .style("font-size", `${this.design.font.size*1.4}px`)

            text.selectAll("tspan")
                .data(this.wordWrap(annotation.name, 10))
                .enter()
                .append("tspan")
                .attr("y", (d, i) => i*this.design.font.size * 2 )
                .attr("x", 0)
                .text( d => d )
    }

    removeAnnotations() {
        this.stage.selectAll(".chart-title").remove()
    }

    protected wordWrap(label:string, lineLength:number):string[] {
        let words = label.split(" ")
        let len = Math.ceil(words.length / lineLength)
        let res = []
        for(let i = 0; i < len; i++) {
                res.push(words.slice(i*lineLength, (i+1)*lineLength).join("  "))
        }
        return res
    }




    /**
     * Hide the whole graph
     **/
    hide() {
        this.stage
        //.transition()
        //.duration(100)
            .style("opacity", 0)
    }

    hideCharacters() {
        this.characters.forEach(c => c.hide()) 
    }

    /**
     * Show the whole graph (typically used after hiding it)
     **/
    unhide() {
        this.stage
        //.transition()
        //.duration(500)
            .style("opacity", 1)
    }


    get name() { return this._name  }
    set name(name:string) {this._name = name }

    get design() { return this._design }
    set design(dsgn:Design) { this._design = dsgn }

    get stage():d3.Selection<any, any, any, any> { return this._stage }
    set stage(stage:d3.Selection<any, any, any, any>) {this._stage = stage }


    set data(d:any) { this._data = throwIfNotSet(d) }
    get data() {return this._data}
    set axes(axes:Map<string, Axis>) {this._axes = axes}
    get axes() {return this._axes}
    set characters(chars:Map<string, Character>) {this._characters = chars}
    get characters() {return this._characters}
    set annotations(annot:Map<string, Annotation>) {this._annotations = annot}
    get annotations() {return this._annotations}


}
