import * as d3 from "d3"
import {Character} from "./Character"
import {interpolatePath} from "./interpolation/interpolatePath"
import {throwIfEmpty} from "./Helpers"



export abstract class ChangingCharacter {
    stage:d3.Selection<any, any, any, any>
    position:number = 0
    
    atPosition(position:number) {
        this.position = position 
        return this
    }

    abstract draw():void 


}
