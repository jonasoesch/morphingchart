import * as d3 from "d3"
import {AxisDefinition, AnnotationDefinition, Named} from "./Definitions"
import {buildMapWithName, valOrDefault, throwIfNotSet} from "./Helpers"
import {Axis} from "./Axis"


export abstract class ChangingAxis {
    stage:d3.Selection<any, any, any, any>
    position:number

    atPosition(position:number) {
        this.position = position
        return this
    }

    abstract draw():void 

}
