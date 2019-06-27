import * as d3 from 'd3'
import {Drawable} from './Drawable'
import {Logger} from "./Logger"
import {FormDefinition, QuestionDefinition} from "./Definitions"
import {Message} from "./Message"
import {flows, urlmap} from "../flows"
import {valOrDefault, getUrlParameter, urlWithParameter} from "./Helpers"

export class Form implements Drawable {
    name:string
    questions:Question[]
    description:string
    logger:Logger
    top:number
    currentPage:string

    constructor(definition:FormDefinition) {
        this.name = definition.name
        this.questions = []
        this.logger = definition.logger
        this.currentPage = definition.currentPage
        this.top = definition.top
        definition.questions.forEach(qDef => {
            if(qDef.kind === "text") {
                this.questions.push(new TextQuestion(qDef, this.logger))
            }
            if(qDef.kind === "choice") {
                this.questions.push(new ChoiceQuestion(qDef, this.logger))
            }
        })
    }

    draw() {
        let form = d3.select(`#${this.name}`)
            .style("height", window.innerHeight * 2 / 3)
            .style("top", this.top + window.innerHeight)
            .append("div").attr("class", "form")

        this.questions.forEach( q => q.drawInto(form) )

        form.append("button")
            .text("Send answer and advance to the next story")
            .on('click', () => {
                try {
                    this.submit()
                } catch(e) {
                    alert(e.message)
                }
            })

    }

    get nextPage() {
        let nextPage:string = "home"
        for (let i =0; i<this.flow.length; i++) {
            if(this.flow[i] === this.currentPage) {
                nextPage = this.flow[i+1]
            }
        }
        nextPage = valOrDefault(nextPage, "home")
        let url = urlWithParameter((urlmap as any)[nextPage], "user", getUrlParameter("user"))
        url = urlWithParameter(url, "flow", this.flowName)
        return url
    }

    get flowName():string {
        return getUrlParameter("flow")
    }

    get flow():string[] {
        let flow = (flows as any)[this.flowName]     
        return  valOrDefault(flow, [])
    }

    getAnswers():string[] {
        let form = d3.select(`#${this.name}`)
        let answers = this.questions.map( q => q.getAnswerFrom(form) )
        return answers
    }


    submit() {
        let answers = this.getAnswers()
        answers.forEach( a => { 
            if(a === ""){
                throw new Error("All fields must be completed") // don't send if answers are empty
            }
        })         

        answers.forEach(a => {
            this.logger.messages.push(new Message({
                user: this.logger.user,
                session: this.logger.session,
                name: `@answer: ${this.name}`,
                absolutePosition: -1,
                answer: a
            })) 
        })

        this.logger.submit()
            .then( (response) => {
                window.location.href = this.nextPage
            })
    }


    hide() {
        d3.select(`#${this.name}`).style("opacity", 0)
    }


    drawScene() {}
    drawCharacters() {}
    hideCharacters() {}
}



abstract class Question {
    name:string
    question:string
    logger:Logger
    constructor(definition:QuestionDefinition, logger:Logger) {
        this.name = definition.name 
        this.question = definition.question
        this.logger = logger
    }
    abstract drawInto(element:d3.Selection<any, any, any, any>):void
        abstract getAnswerFrom(element:d3.Selection<any, any, any, any>):string
}

export class TextQuestion extends Question {
    drawInto(element:d3.Selection<any, any, any, any>) {
        let logger = this.logger

        let container = element.append("p").attr("class", "question")

        container.append("label")
            .attr("class", "question-label")
            .text(this.question)
        container.append("textarea")
            .attr("type" ,"text")
            .attr("placeholder", "Your answer…")
            .attr("name", this.name) 
            .on("input", function() {
                logger.typing(d3.select(this).node().value)
            })
    }

    getAnswerFrom(element:d3.Selection<any, any, HTMLInputElement, any>) {
        return (element.select(`textarea[name="${this.name}"]`).node() as HTMLInputElement).value
    }
}

export class ChoiceQuestion extends Question {
    answers:string[]
    constructor(definition:QuestionDefinition, logger:Logger) {
        super(definition, logger) 
        this.answers = definition.answers
    }
    drawInto(element:d3.Selection<any, any, any, any>) {


        let container = element.append("p").attr("class", "question")

        container.append("label")
            .attr("class", "question-label")
            .text(this.question)

        this.answers.forEach( o => {
            let line = container.append("p")
            line.append("input")  
                .attr("type", "radio")
                .attr("name", this.name)
                .attr("value", o)
            line.append("label")
                .attr("class", "radio-label")
                .text(o)
        })
    }
    getAnswerFrom(element:d3.Selection<any, any, any, any>) {
        let out = ""
        element.selectAll(`input[name="${this.name}"]`).each( function(el) {
            if((this as HTMLInputElement).checked) {
                out =  (this as HTMLInputElement).value 
            }   
        })
        return out
    }
}
