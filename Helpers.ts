import {Named} from "./Definitions"

export function buildMapWithName(list:Named[], buildMethod:Function):Map<string, any> {
    let m = new Map()
    if (list === undefined) {return}
    list.forEach( (item:Named) => {
        m.set(item.name, buildMethod(item)) 
    })
    return m
}

export function  throwIfNotSet<T>(value:T, msg?:string):T {
    if(value === null || value === undefined) {
        throw new Error(valOrDefault(msg, "A value is null and shouldn't be null"))
    }
    return value
}

export function valOrDefault<T>(value:T, deflt:T):T {
    if(value === null || value === undefined) {return deflt} 
    else {return value}
}

export function throwIfEmpty<T>(value:T[], msg?:string) {
    throwIfNotSet(value, msg)
    if(value.length === 0) {
        throw new Error(valOrDefault(msg, "An array has nothing in it.")) 
    }
    return value
}



export function getUrlParameter(key:string) {
    let urlString = window.location.href
    let url = new URL(urlString)
    let value = url.searchParams.get(key);
    return valOrDefault(value, "")
}

export function setUrlParameter(key:string, value:string) {
    let urlString = window.location.href
    window.location.href =  urlWithParameter(urlString, key, value)
}

export function urlWithParameter(urlString:string, key:string, value:string) {
    let url = new URL(urlString)
    let searchParams = new URLSearchParams(url.search)
    searchParams.set(key, value)
    url.search = searchParams.toString()
    return url.toString()
}

export function overwriteDefaults(defaults:any, override:any):any {
    let keys = []


    if(override === null || override === undefined || override == {} || (typeof override === "string")) {
        return defaults
    }


    for(let k in override) {
        if(override.hasOwnProperty(k))  {
            keys.push(k) 
        }
    }
    if(keys.length === 0) {
        return override 
    }
    else {
        keys.forEach( k => {
            defaults[k] = overwriteDefaults(defaults[k], override[k])
        })
        return defaults
    }
}
