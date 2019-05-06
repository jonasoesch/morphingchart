import * as d3 from "d3"
import {Drawable} from "./Drawable"
import {ChangingChart} from "./ChangingChart"
import {ChangingeChartDefinition, ChangingCharacterDefinition, ChangingAxisDefinition} from "./Definitions"
import {Chart} from "./Chart"
import {FadingCharacter} from "./FadingCharacter"
import {Character} from "./Character"
import {FadingAxis} from "./FadingAxis"
import {throwIfNotSet} from "./Helpers"


export class FadingChart extends ChangingChart {

    fromCharacters:FadingCharacter[]
    toCharacters:FadingCharacter[]
    axes:FadingAxis[]

    constructor(chartDef:ChangingeChartDefinition) {
        super(chartDef)
        this.fromCharacters = this.buildFromCharacters()
        this.toCharacters = this.buildToCharacters()
        this.buildCharacters(this.to)
        this.axes = this.buildAxes()
    }


    draw() {
        this.hide()
        this.fromCharacters.forEach(c => c.atPosition(1).draw())
        this.toCharacters.forEach(c => c.atPosition(this.position).draw())
        this.axes.forEach(a => a.draw())
        this.stage.attr("transform", `translate(${this.coordinates.left}, ${this.coordinates.top})`)
    }

    buildFromCharacters() {
        return this.buildCharacters(this.from) 
    }

    buildToCharacters() {
        return this.buildCharacters(this.to) 
    }

    buildCharacters(chart:Chart) {
        return Array.from(chart.characters).map((args) => new FadingCharacter(args[1], this.characterStage()) ) 
    }

    buildAxes() {
        return Array.from(this.from.axes).map((args) => new FadingAxis(args[1], this.axisStage()))
    }


}
