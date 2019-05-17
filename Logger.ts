import {Message} from "./Message"
/**
 * This class contains the code necessary to generate log-entries.
 * It is used for logging draw-calls as well as responses from the survey.
 **/
export class Logger {
    messages:Message[]
    session:string
    user:string

    waitingForActionSince:number

    constructor() {
        this.user = this.getUser()
        this.session = this.uuid()
        this.messages = []

        this.waitingForActionSince = 0

        this.init()
        this.send()
    }

    /**
     * Returns a unique user ID in all cases. If the user already has an ID, the method reads it
     * from a cookie. Otherwise it returns a new ID and stores it in a cookie.
     **/
    getUser() {
        if(!this.getCookie('user')) {
            console.log("nope", this.getCookie('user'))
            this.setCookie('user', this.uuid())
        } 
        console.log("yep", this.getCookie('user'))
        return this.getCookie('user') 
    }

    /**
     * Generate a (hopefully) unique ID.
     **/
    private uuid() {
        return Date.now() + "-" + Math.random().toString(36).replace(";", "a").replace("=", "b") 
    }


    /**
     * Gets the value for a cookie. Returns `null` if the name
     * does not exist.
     **/
    private getCookie(name:string):(string | null) {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(document.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }

    private setCookie(key:string, value:string) {
        document.cookie = `${key}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT"`; 
    }

    /**
     * Records a draw call, typically from a director.
     **/
    public animation(name:string, relativePosition:number, absolutePosition:number) {
        this.waitIsOver()
        this.messages.push(new Message({
            user: this.user,
            session: this.session,
            name: name,
            relativePosition: relativePosition,
            absolutePosition: absolutePosition,
        })) 
    }

    public typing(text:string) {
        this.waitIsOver()
        this.messages.push(new Message({
            user: this.user,
            session: this.session,
            name: `@typing: ${text}`,
            relativePosition: -1,
            absolutePosition: -1,
        })) 
    }

    /**
     * Records an "alive"-entry. These entries are generated periodically when the
     * reader does not scroll but still has the experiment open.
     **/
    public alive() {
        if(!this.waitMore()) {return}
        this.messages.push(new Message({
            user: this.user,
            session: this.session,
            name: "@alive",
            absolutePosition: -1
        })) 
    }


    public error(message:string) {
        this.messages.push(new Message({
            user: this.user,
            session: this.session,
            name: `@error: ${message}`,
            absolutePosition: -1,
        })) 
    }

    private waitMore() {
        this.waitingForActionSince = this.waitingForActionSince + 20
        return this.waitingForActionSince < 120 // don't wait more than 2 min
    }

    private waitIsOver() {
        this.waitingForActionSince = 0 
    }

    /**
     * Records that the experiment has been loaded.
     **/
    public init() {
        this.messages.push(new Message({
            user: this.user,
            session: this.session,
            name: '@init',
            absolutePosition: -1,
        })) 
    }


    /**
     * Formats the log-entries for draw-calls properly:
     **/
    public toString() {
        // timestamp, user, session, scroll 
        let out = ""
        this.messages.forEach( (m) => {
            out = out + m.toString()
        })
        return out
    }


    /**
     * Sends the latest records to the server removes them from the storage.
     **/
    public send(){
        if(this.messages.length === 0) {return Promise.reject()}
        const body = this.toString()
        return fetch("__API_URL__"+"form", {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body
        }).then((resp) => {
            this.messages = []
            return resp
        })
    }

    public submit() {
        return this.send()
            .then( (response) => {
                if (!response.ok) {
                    throw new Error("The server is doing funny things. Please try again.") 
                }
                return response.text()
            })
            .then( (text) => {
                if(text !== "OK") {
                    throw new Error("The server is doing funny things. Please try again.") 
                };
                return true
            })
    }
}
