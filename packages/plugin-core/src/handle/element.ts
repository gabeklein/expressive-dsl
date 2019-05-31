import { NodePath as Path } from '@babel/traverse';
import { AssignmentExpression, Expression, For, IfStatement, TemplateLiteral, UnaryExpression, Statement, VariableDeclaration, DebuggerStatement, FunctionDeclaration, expressionStatement } from '@babel/types';
import { AddElementsFromExpression, StackFrame } from 'parse';
import { inParenthesis, ParseErrors } from 'shared';
import { BunchOf, DoExpressive, InnerContent } from 'types';

import { AttributeBody, ComponentFor, ComponentIf, ElementModifier, ExplicitStyle, Modifier, Prop } from './';

const Error = ParseErrors({
    PropNotIdentifier: "Assignment must be identifier name of a prop.",
    AssignmentNotEquals: "Only `=` assignment may be used here.",
    BadShorthandProp: "\"+\" shorthand prop must be an identifier!",
    UnarySpaceRequired: "Unary Expression must include a space between {1} and the value.",
    StatementInElement: "Statement insertion not implemented while within elements!",
})

export class ElementInline extends AttributeBody {
    
    doBlock?: DoExpressive
    primaryName?: string;
    multilineContent?: Path<TemplateLiteral>;
    children = [] as InnerContent[];
    explicitTagName?: string;
    modifiers = [] as Modifier[];
    data = {} as BunchOf<any>;

    adopt(child: InnerContent){
        const index = this.children.push(child);
        if("context" in child && child.context instanceof StackFrame)
            child.context.resolveFor(index);
        this.add(child);
    }

    ExpressionDefault(path: Path<Expression>){
        if(inParenthesis(path))
            this.adopt(path)
        else
            AddElementsFromExpression(path, this);
    }

    ElementModifier(mod: ElementModifier){
        this.context.elementMod(mod);
    }

    IfStatement(path: Path<IfStatement>){
        const mod = new ComponentIf(path, this.context);
        this.adopt(mod)
    }

    ForInStatement(path: Path<For>){
        this.ForStatement(path)
    }

    ForOfStatement(path: Path<For>){
        this.ForStatement(path)
    }

    ForStatement(path: Path<For>){
        this.adopt(
            new ComponentFor(path, this.context)
        )
    }
    
    UnaryExpression(path: Path<UnaryExpression>){
        const value = path.get("argument");
        const op = path.node.operator

        switch(op){
            case "delete":
                this.ExpressionAsStatement(value);
                return

            case "void":
            case "!":
                this.ExpressionDefault(path)
                return 
        }

        if(path.node.start !== value.node.start! - 2)
            throw Error.UnarySpaceRequired(path, op)

        switch(op){
            case "+": 
                if(value.isIdentifier())
                    this.add(
                        new Prop(value.node.name, value.node)
                    );
                else 
                    throw Error.BadShorthandProp(path);
            break;

            case "-":
                this.add(
                    new Prop("className", value.node)
                );
            break;

            case "~": 
                this.add(
                    new ExplicitStyle(false, value.node)
                );
            break
        }
    }

    ExpressionAsStatement(path: Path<Expression>){
        throw Error.StatementInElement(path)
    }

    AssignmentExpression(path: Path<AssignmentExpression>){
        if(path.node.operator !== "=") 
            throw Error.AssignmentNotEquals(path)

        const left = path.get("left");
        
        if(!left.isIdentifier())
            throw Error.PropNotIdentifier(left)

        let { name } = left.node;

        this.insert(
            new Prop(name, undefined, path.get("right")));
    }
}

export class ComponentContainer extends ElementInline {

    statements = [] as Statement[];

    ExpressionAsStatement(path: Path<Expression>){
        this.statements.push(expressionStatement(path.node));
    }

    VariableDeclaration(path: Path<VariableDeclaration>){
        this.statements.push(path.node);
    }

    DebuggerStatement(path: Path<DebuggerStatement>){
        this.statements.push(path.node);
    }

    FunctionDeclaration(path: Path<FunctionDeclaration>){
        this.statements.push(path.node);
    }
}