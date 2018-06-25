const t = require('babel-types')
const { GeneralModifier, ComponentModifier } = require("./modifier")
const { Shared, transform } = require("./shared");
const ReservedModifiers = require("./keywords")

export function createSharedStack(included = []){
    let Stack = new StackFrame;

    for(const inclusion of [ReservedModifiers].concat(included)){
        Stack = Object.create(Stack)
        
        const { Helpers, ... Modifiers } = inclusion;

        if(Helpers)
        for(const name in Helpers)
            Stack.getModifier(name) = Helpers[name];

        for(const name in Modifiers)
            Stack.get(name) = Modifiers[name];
    }

    return Stack;
}

class StackFrame {
    push(node){
        node.parent = this.current;
        const frame = node.context = Shared.stack = Object.create(Shared.stack);
        frame.current = node;
    }

    get parent(){
        return Object.getPrototypeOf(this);
    }

    pop(){
        Shared.stack = Object.getPrototypeOf(this);
    }

    get(name){
        return this["__" + name];
    }

    getModifier(name){
        return this["$" + name];
    }

    declare(modifier){
        const { name } = modifier;
        if(this.hasOwnProperty(name))
            throw body.buildCodeFrameError(`Duplicate declaration of named modifier!`)

        this['__' + name] = modifier;
    }
}
