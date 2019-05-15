import * as d3 from 'd3'
import {Drawable} from './Drawable'
import {Logger} from "./Logger"
import {FormDefinition, QuestionDefinition} from "./Definitions"


export class Form implements Drawable {
    name:string
    questions:Question[]
    description:string
    nextPage:string
    //logger:Logger

    constructor(definition:FormDefinition) {
        this.name = definition.name
        this.questions = []
        this.nextPage = definition.nextPage
        //this.logger = definition.logger
        definition.questions.forEach(qDef => {
            if(qDef.kind === "text") {
                this.questions.push(new TextQuestion(qDef))
            }
            if(qDef.kind === "choice") {
                this.questions.push(new ChoiceQuestion(qDef))
            }
        })
    }

    draw() {
        let form = d3.select(`#${this.name}`)
            .style("height", window.innerHeight * 2 / 3)
            .style("top", 1110 + window.innerHeight)
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


    getAnswers():string[] {
        let form = d3.select(`#${this.name}`)
        let answers = this.questions.map( q => q.getAnswerFrom(form) )
        return answers
    }


    format(answers:string[]):string {
        let out = ""
        /**
        out = out + this.logger.wrap( Date.now().toString()) + "," // Timestamp
        out = out + this.logger.wrap( this.logger.url ) + "," // URL
        out = out + this.logger.wrap( this.logger.user ) + "," // User ID from cookie
        out = out + this.logger.wrap( this.logger.session ) + "," // Session ID
        answers.forEach( a => { out = out + this.logger.wrap(a) + "," } )
        **/
        return out
    }


    submit() {
        let answers = this.getAnswers()
        answers.forEach( a => { 
            if(a === ""){
                throw new Error("All fields must be completed") // don't send if answers are empty
            }
        })         
        const body = this.format(answers)
        fetch("__API_URL__"+"form", {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body,
        })
            .then( (response) => {
                if (!response.ok) {
                    throw new Error("The server is doing funny things. Please try again.") 
                }
                return response.text()
            })
            .then( (text) => {
                if(text !== "OK") {
                    throw new Error("The server is doing funny things. Please try again.") 
                }
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
    constructor(definition:QuestionDefinition) {
        this.name = definition.name 
        this.question = definition.question
    }
    abstract drawInto(element:d3.Selection<any, any, any, any>):void
    abstract getAnswerFrom(element:d3.Selection<any, any, any, any>):string
}

class TextQuestion extends Question {
    drawInto(element:d3.Selection<any, any, any, any>) {
        element.append("label")
            .text(this.question)
        element.append("textarea")
            .attr("type" ,"text")
            .attr("placeholder", "Your answer…")
            .attr("name", this.name) 
    }

    getAnswerFrom(element:d3.Selection<any, any, HTMLInputElement, any>) {
        return (element.select(`textarea[name="${this.name}"]`).node() as HTMLInputElement).value
    }
}

class ChoiceQuestion extends Question {
    answers:string[]
    constructor(definition:QuestionDefinition) {
        super(definition) 
        this.answers = definition.answers
    }
    drawInto(element:d3.Selection<any, any, any, any>) {
        element.append("label")
            .text(this.question)
        this.answers.forEach( o => {
            element.append("input")  
                .attr("type", "radio")
                .attr("name", this.name)
                .attr("value", o)
            element.append("label")
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
