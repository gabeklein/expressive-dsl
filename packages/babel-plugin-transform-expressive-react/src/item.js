import { transform } from './shared';

const t = require('babel-types')
const { Opts } = require("./shared");
const { HEX_COLOR } = require("./attributes")

export class Attribute {

    constructor(path){
        this.path = path;
    }

    get id(){
        return t.identifier(this.name);
    }

    get value(){
        const value = this.static;
        if(value) switch(typeof value){
            case "string": return t.stringLiteral(value)
            case "number": return t.numericLiteral(value)
        }
    }

    get asProperty(){
        const { name, value, isSpread } = this;
        if(isSpread){
            return t.spreadProperty(this.value)
        } else {
            if(!name) {
                throw new Error("Internal Error: Prop has no name!")
            }
            return t.objectProperty(t.identifier(this.name), this.value)
        }
    }

    asAssignedTo(target){
        const { name, isSpread } = this;
        let assign;

        if(isSpread){
            assign = t.callExpression(
                t.memberExpression(
                    t.identifier("Object"),
                    t.identifier("assign")
                ), 
                [   target, this.value   ]
            )
        } else {
            if(!name) {
                debugger
                throw new Error("Internal Error: Prop has no name!")
            }
            assign = t.assignmentExpression("=",
                t.memberExpression(target, t.identifier(name)), this.value
            )
        }

        return t.expressionStatement(assign);
    }
}

export class SyntheticProp extends Attribute {

    inlineType = "props"
    precedence = 1

    constructor(name, value) {
        this.name = name;
        Object.defineProperty(this, "value", {
            value, configurable: true
        })
    }
}

export class Prop extends Attribute {

    inlineType = "props"
    precedence = 1

    static applyTo(parent, path){
        if(path.node.operator != "=") 
            path.buildCodeFrameError("Only `=` assignment may be used here.")
        parent.add( 
            new this(path)
        )
    }

    constructor(path){
        super(path)
        const { computed } = this;
        if(computed){
            this.static = computed;
            delete this.precedence;
        }
    }

    get computed(){
        let value;
        const { node } = this.path;
        const { extra } = value = node.right;

        this.name = node.left.name;

        if( t.isNumericLiteral(value))
            return /^0x/.test(extra.raw)
                ? HEX_COLOR(extra.raw)
                : extra.rawValue
        else if(t.isStringLiteral(value))
            return value.value;
    }

    get value(){
        return super.value || this.path.node.right;
    }
}

export class Statement {

    inlineType = "stats"

    static applyTo(parent, path, mod){
        parent.add( 
            new this(path, mod)
        )
    }

    output(){
        return this.node;
    }

    constructor(path, kind){
        this.kind = kind;
        if(kind != "debug")
            this.node = path.node;
    }
}

export class ChildNonComponent {

    inlineType = "child"
    
    precedence = 3

    static applyMultipleTo(parent, src){
        const elem = src.get("elements");
        if(elem.length == 1 && elem[0].isSpreadElement())
            parent.add(
                new this(elem[0].get("argument"))
            )
        else for(const inclusion of src.get("elements"))
            parent.add(
                new this(inclusion)
            )
    }

    static applyVoidTo(parent){
        if(Opts.ignoreExtraSemicolons == false)
            parent.add(
                new this(t.booleanLiteral(false))
            )
    }

    static applyTo(parent, path){
        parent.add(
            new this(path)
        )
    }

    outputInline(){
        return this.path.node;
    }

    transform(){
        return { product: this.path.node }
    }

    collateChildren(){
        return {
            output: [ this.path.node ]
        }
    }

    constructor(src){
        this.path = src
    }
}