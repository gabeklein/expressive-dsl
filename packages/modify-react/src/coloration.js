const { URL_IMAGES } = process.env;
const { rgba, hsla } = require("./helpers.js")

export function image(a){
    const CDN = process.env.CDN || "";
    if(CDN)
        a = CDN + a;
    
    return {
        style: {
            backgroundImage: `url("${a}")`
        }
    }
}

export function shadow(color, radius = 10, x = 2, y = x){
    let value;
    if(color == "intial" || color == "none")
        value = color;
    else {
        value = `${x}px ${y}px ${radius}px ${color}`;
    }
    return {
        style: {
            boxShadow: value
        }
    }
}

export function outline(a, b){
    return a == "none"     ? {style: { outline: "none" }}
        :  b == undefined  ? {style: { outline: `1px dashed ${a || "green"}` }}
        :  {attrs: { outline: this.arguments }}
}


export function bg(a){
    let output;

    if(Array.isArray(a)){
        const [ head, ...tail ] = a;
        const dir = URL_IMAGES || "";
        switch(head){
            case "url":
                output = {
                    backgroundImage: `url(${dir + tail[1]})`
                };
                break;

            case "rgb":
            case "rgba": {
                const { value } = rgba(...tail);
                output = { backgroundColor: value };
                break;
            }

            case "hsl":
            case "hsla": {
                const { value } = hsla(...tail);
                output = { backgroundColor: value };
                break;
            }
        }
    }
    else {
        output = {
            background: a
        }
    }

    return {
        style: output
    }
}

export function backgroundImage(a){
    if(typeof a == "object" && !a.named)
        return { style: {
            backgroundImage: a
        }}
    else 
        return { attrs: {
            backgroundImage: this.arguments
        }} 
}