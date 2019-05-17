import {MessageDefinition} from "./Definitions"
import {valOrDefault} from "./Helpers"

export class Message {

    timestamp:Date
    url:string
    user:string
    session:string
    ua:string
    screenWidth:number
    screenHeight:number
    windowWidth:number
    windowHeight:number
    pixelRatio:number
    name:string
    relativePosition:number
    absolutePosition:number
    answer:string

    constructor(definition:MessageDefinition) {
        this.timestamp = new Date()
        this.url = window.location.href
        this.user = definition.user
        this.session = definition.session
        this.ua = window.navigator.userAgent
        this.screenWidth = window.screen.width
        this.screenHeight = window.screen.height
        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
        this.pixelRatio = window.devicePixelRatio
        this.name = definition.name
        this.relativePosition = valOrDefault(definition.relativePosition, -1)
        this.absolutePosition = definition.absolutePosition
        this.answer = valOrDefault(definition.answer, "")
    }

    public wrap(str:string, into='"') {
        return  into+this.escape(str)+into
    }

    escape(str:string):string {
        return str.replace("\n", " ").replace("\t", " ").replace(/"/g, "*")
    }


    public toString() {
        let out = ""
        out = out + this.wrap( this.timestamp.getTime().toString()) + ","
        out = out + this.wrap( this.url                     ) + ","
        out = out + this.wrap( this.user                    ) + ","
        out = out + this.wrap( this.session                 ) + ","
        out = out + this.wrap( this.ua                      ) + ","
        out = out + this.wrap( this.screenWidth.toString()  ) + ","
        out = out + this.wrap( this.screenHeight.toString() ) + ","
        out = out + this.wrap( this.windowWidth.toString()  ) + ","
        out = out + this.wrap( this.windowHeight.toString() ) + ","
        out = out + this.wrap( this.pixelRatio.toString()   ) + ","
        out = out + this.wrap( this.name                    ) + ","
        out = out + this.wrap( this.relativePosition.toString()) + ","
        out = out + this.wrap( this.absolutePosition.toString()) + ","
        out = out + this.wrap( this.answer                  ) + "\n"
        return out
    }
}
