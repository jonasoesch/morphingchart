import * as d3 from "d3"
import {AxisDefinition, AnnotationDefinition, Named} from "./Definitions"
import {buildMapWithName, valOrDefault, throwIfNotSet} from "./Helpers"
import {ChangingAxis} from "./ChangingAxis"
import {Axis} from "./Axis"


export class FadingAxis extends ChangingAxis {
    axis:Axis

    constructor(
        axis:Axis,
        stage:d3.Selection<any,any,any,any>
    ) {
        super()     
        this.axis = axis
        this.stage = stage
    }

    draw() {
        let scale = this.axis.scale.copy()
        let axis = this.axis.getAxis(scale)
        this.stage
            .append("g")
            .attr("transform", this.axis.translate())
            .call(axis)
    }


}
