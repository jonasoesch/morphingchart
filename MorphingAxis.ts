import * as d3 from "d3"
import {AxisDefinition, AnnotationDefinition, Named} from "./Definitions"
import {buildMapWithName, valOrDefault, throwIfNotSet} from "./Helpers"
import {Axis} from "./Axis"


export class MorphingAxis {
    stage:d3.Selection<any, any, any, any>
        from:Axis
    to:Axis
    position:number


    constructor(
        from:Axis,
        to:Axis,
        stage:d3.Selection<any,any,any,any>
    ) {
        this.stage = stage
        this.from = from
        this.to = to
        this.position = 0
    }

    atPosition(position:number) {
        this.position = position
        return this
    }

    draw() {
        let interpolator = d3.interpolate(this.from.scale.domain(), this.to.scale.domain())
        let d:any = interpolator(this.position)
        let scale = this.from.scale.copy()
        let s = (scale as any).domain(d)
        let axis = this.from.getAxis(s)
        this.stage
        .call(axis)
    }

}
