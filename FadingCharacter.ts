import * as d3 from "d3"
import {ChangingCharacter} from "./ChangingCharacter"
import {Character} from "./Character"
import {interpolatePath} from "./interpolation/interpolatePath"
import {throwIfEmpty} from "./Helpers"

export class FadingCharacter extends ChangingCharacter {
    character:Character

    constructor(character:Character, stage:d3.Selection<any, any, any, any>) {
        super()
        this.character = character
        this.stage = stage
    }

    draw() {
        this.hide()
        this.stage.append("path") 
            .attr("d", this.character.path)
            .attr("fill", this.character.color)
            .attr("opacity", this.position)
    }

    hide() {
        this.stage.selectAll("*").remove()
    }
}
