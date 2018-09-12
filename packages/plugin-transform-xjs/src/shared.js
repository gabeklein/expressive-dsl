const t = require("@babel/types")

//basically a singleton
export const Shared = {
    set(data){
        Object.assign(this, data);
    }
}

export const env = process.env || {
    NODE_ENV: "production"
};

export const Opts = {}

export const transform = {

    IIFE(stats){
        return t.callExpression(
            t.arrowFunctionExpression([], 
                t.blockStatement(stats)
            ), []
        )
    },

    createFragment(elements){

        let type = Shared.stack.helpers.Fragment;

        if(false){
            type = t.jSXIdentifier(type.name);
            return t.jSXElement(
                t.jSXOpeningElement(type, []),
                t.jSXClosingElement(type), 
                elements.map( child => {
                    if(child.type == "StringLiteral")
                        return t.jSXText(child.value);
                    if(child.type == "JSXElement")
                        return child;
                    return t.jSXExpressionContainer(child);
                })
            )
        }

        return this.createElement(
            type, t.objectExpression([]), ...elements
        )
    },

    createElement(type, props, ...children){

        if(false)
            return this.createJSXElement(type, props, children);

        if(typeof type == "string") type = t.stringLiteral(type);
        if(!props) props = t.objectExpression([]);

        return t.callExpression(Shared.stack.helpers.createElement, [type, props, ...children])
    },

    createJSXElement(type, props, children){
        if(type.type)
            type = type.value || type.name;

        type = t.jSXIdentifier(type);

        props = props.type == "Identifier" ?
            [ t.jSXSpreadAttribute(props) ] :
            props.properties.map((x) => {

                let { key, value } = x;

                if(key.type == "Identifier")
                    key.type = "JSXIdentifier"
                else debugger;

                if(value.type != "StringLiteral" && value.type != "JSXElement")
                    value = t.jSXExpressionContainer(value);

                return t.jSXAttribute(key, value)
            })

        return t.jSXElement(
            t.jSXOpeningElement(type, props),
            t.jSXClosingElement(type), 
            children.map( child => {
                if(child.type == "StringLiteral")
                    return t.jSXText(child.value);
                if(child.type == "JSXElement")
                    return child;
                return t.jSXExpressionContainer(child);
            })
        )
    },

    element(){
        return {
            inlineType: "child",
            transform: () => ({
                product: this.createElement(...arguments)
            })
        }
    },

    object(obj){
        const properties = [];
        for(const x in obj)
            properties.push(
                t.objectProperty(
                    t.identifier(x),
                    obj[x]
                )
            )
        return t.objectExpression(properties);
    },

    member(object, ...path){
        if(object == "this") object = t.thisExpression()
        for(let x of path){
            if(typeof x == "string"){
                if(/^[A-Za-z0-9$_]+$/.test(x)){
                    object = t.memberExpression(object, t.identifier(x));
                    continue;
                }
                else x = t.stringLiteral(x)
            }
            else if(typeof x == "number")
                x = t.numericLiteral(x);

            object = t.memberExpression(object, x, true)
        }
        return object
    },

    declare(type, id, value){
        return (
            t.variableDeclaration(type, [
                t.variableDeclarator(id, value)
            ])
        )
    }

}