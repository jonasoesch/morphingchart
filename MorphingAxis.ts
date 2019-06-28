import * as d3 from "d3"
import {AxisDefinition, AnnotationDefinition, Named} from "./Definitions"
import {buildMapWithName, valOrDefault, throwIfNotSet} from "./Helpers"
import {ChangingAxis} from "./ChangingAxis"
import {Axis} from "./Axis"


export class MorphingAxis extends ChangingAxis {
    from:Axis
    to:Axis

    constructor(
        from:Axis,
        to:Axis,
        stage:d3.Selection<any,any,any,any>
    ) {
        super()     
        this.stage = stage
        this.from = from
        this.to = to
    }

    draw() {
        let interpolator = d3.interpolate(this.from.scale.domain(), this.to.scale.domain())
        let d:any = interpolator(this.position)
        let scale = this.from.scale.copy()
        let s = (scale as any).domain(d)
        let t:any = null

        if(this.from.ticks && this.to.ticks) {
            t = d3.interpolate(this.from.ticks, this.to.ticks)(this.position)
        }
        let axis = this.from.getAxis(s, t)



        this.stage
            .append("g")
            .attr("transform", this.to.translate())
            .call(axis)


        if(this.from.name === "x") {
            this.stage.selectAll(".tick line")
                .attr("y2", this.from.height*-1)
                .attr("stroke-width", 2)
        }

        this.stage.lower()
    }

}

