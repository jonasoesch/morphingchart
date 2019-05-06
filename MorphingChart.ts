import * as d3 from "d3"
import {Drawable} from "./Drawable"
import {ChangingChart} from "./ChangingChart"
import {MorphingChartDefinition, ChangingCharacterDefinition, ChangingAxisDefinition} from "./Definitions"
import {Chart} from "./Chart"
import {Character} from "./Character"
import {Axis} from "./Axis"
import {MorphingCharacter} from "./MorphingCharacter"
import {MorphingAxis} from "./MorphingAxis"
import {Design} from "./Design"
import {valOrDefault, throwIfNotSet} from "./Helpers"



export class MorphingChart extends ChangingChart {

    characters:MorphingCharacter[]
    axes:MorphingAxis[]

    constructor(chartDef:MorphingChartDefinition) {
        super(chartDef)
        this.characters = this.buildCharacters(chartDef.characters)
        this.axes = this.buildAxes(valOrDefault(chartDef.axes, []))
    }



    buildCharacters(charaDefs:ChangingCharacterDefinition[]) {
        return charaDefs.map( (charaDef:ChangingCharacterDefinition) => {
            return new MorphingCharacter(
                this.getCharacter(this.from, charaDef.from),
                this.getCharacter(this.to, charaDef.to),
                this.characterStage(),
            ) 
        })
    }


    buildAxes(axesDef:ChangingAxisDefinition[]) {
        return  axesDef.map( (axisDef:ChangingAxisDefinition) => {
            return new MorphingAxis(
                this.getAxis(this.from, axisDef.from),
                this.getAxis(this.to, axisDef.to),
                this.axisStage(),
            ) 
        } )
    }


     draw() {
        this.hide()
        this.characters.forEach( c => c.atPosition(this.position).draw() )
        this.axes.forEach(a => a.atPosition(this.position).draw())
        this.stage.attr("transform", `translate(${this.coordinates.left}, ${this.coordinates.top})`)
    }

  
}
