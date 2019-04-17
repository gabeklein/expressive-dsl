import t, { Expression, JSXElement, TemplateLiteral } from '@babel/types';
import { ElementReact, GenerateReact } from 'internal';
import { ContentLike, IsLegalAttribute, JSXContent, PropData } from 'types';

export class GenerateJSX extends GenerateReact {
    
    get Fragment(){
        const Fragment = t.jsxIdentifier(
            this.external.ensure("react", "Fragment").name
        );
        Object.defineProperty(this, "Fragment", { configurable: true, value: Fragment })
        return Fragment;
    }
    
    willExitModule(){
        if(this.module.lastInsertedElement)
            this.external.ensure("react", "default", "React")
    }

    element(src: ElementReact): JSXElement {
            
        const {
            tagName: tag,
            props,
            children
        } = src;

        const type = t.jsxIdentifier(tag);
        const properties = props.map(this.recombineProps)
    
        return (
            t.jsxElement(
                t.jsxOpeningElement(type, properties),
                t.jsxClosingElement(type),
                this.recombineChildren(children),
                children.length > 0
            ) 
        )
    }

    fragment(
        children = [] as ContentLike[],
        key?: Expression | false
    ){
        const attributes = !key ? [] : [
            t.jsxAttribute(
                t.jsxIdentifier("key"), 
                t.jsxExpressionContainer(key)
            )
        ]
        
        return (
            t.jsxElement(
                t.jsxOpeningElement(this.Fragment, attributes),
                t.jsxClosingElement(this.Fragment),
                this.recombineChildren(children),
                false
            )
        )
    }

    private recombineChildren(
        input: ContentLike[]){
    
        const output = [] as JSXContent[];
        for(const child of input){
            let jsx;
    
            if(t.isExpression(child)){
                if(t.isTemplateLiteral(child)){
                    output.push(...this.recombineQuasi(child))
                    continue
                }
                if(t.isStringLiteral(child) 
                && child.value.indexOf("{") < 0
                && input.length == 1)
                    jsx = t.jsxText(child.value)
                else
                    jsx = t.jsxExpressionContainer(child);
            }
            else {
                jsx = "toExpression" in child
                    ? t.jsxExpressionContainer(child.toExpression(this))
                    : this.element(child)
            }
    
            output.push(jsx);
        }
    
        return output;
    }
    
    private recombineQuasi(node: TemplateLiteral){
        const { expressions, quasis } = node;
        const acc = [] as JSXContent[];
        let i = 0;
    
        while(true) {
            const value = quasis[i].value.cooked as string;
            if(value)
                acc.push( 
                    value.indexOf("{") < 0
                        ? t.jsxText(value)
                        : t.jsxExpressionContainer(t.stringLiteral(value))
                )
    
            if(i in expressions)
                acc.push(
                    t.jsxExpressionContainer(
                        expressions[i++]))
            else break;
        }
    
        return acc;
    }
    
    private recombineProps({ name, value }: PropData){
        if(typeof name !== "string")
            return t.jsxSpreadAttribute(value);
        else {
            if(IsLegalAttribute.test(name) == false)
                throw new Error(`Illegal characters in prop named ${name}`)
    
            const insertedValue = 
                t.isStringLiteral(value)
                    ? value.value == "true"
                        ? null
                        : value
                    : t.jsxExpressionContainer(value)
    
            return t.jsxAttribute(
                t.jsxIdentifier(name), 
                insertedValue
            )
        }
    }
}