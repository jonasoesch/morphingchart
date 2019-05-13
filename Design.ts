import {DesignDefinition} from "./Definitions"
import {valOrDefault, overwriteDefaults} from "./Helpers"

export class Design {
    font = {
        color: "#222",
        family:"Fira Sans",
        size: 10
    }

    margin = {
        left: 80,
        top: 140,
        right: 80,
        bottom: 80
    }

    line = {
        color: "#222",
        weight: 3
    }

    constructor(definition?:DesignDefinition) {
        if(definition) {
            this.margin = overwriteDefaults(this.margin, definition.margin) 
            this.font = overwriteDefaults(this.font, definition.font) 
        }
    }
}

