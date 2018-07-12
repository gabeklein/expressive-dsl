//needed only to prevent a webpack "no instrumentation found" error


import PropTypes from 'prop-types';
import { Component, createElement, Fragment } from "react";

import StyledOutput from "./output"

export const Cache = new class {

    blocks = [];

    moduleDoesYieldStyle(fromFile, css){
        for(let x in css)
            Object.assign(this.blocks[x] || (this.blocks[x] = {}), css[x])
    }

    get(selector){
        for(let block of this.blocks)
            if(block = block[selector])
                return block
    }
}

class Compiler {
    registered = {};
    knownBlocks = {};

    push(hashID, classNames){
        const { registered, parent, knownBlocks, outputElement } = this;

        if(!knownBlocks[hashID]){
            if(outputElement) 
                outputElement.setState({
                    mostRecentBlock: hashID
                })
            knownBlocks[hashID] = true;
            for(const x of classNames)
                if(!registered[x])
                    registered[x] = true;
        }
    }

    generate(){
        let output = `\n`;
        const { registered } = this;
        let i = 1, len = Cache.blocks.length;
        for(const block of Cache.blocks){
            const prio = len + 1 - i++;
            output += "/* importance: " + prio + " */\n"
            for(const select in block){
                const styles = registered[select] && block[select];
                if(styles)
                    output += `.` + select + " { " + styles + " }" + `\n`;
            }
            if(prio > 1)
                output += "\n"
        }

        if(output.length > 1)
            return output;
        else 
            return "";
    }
}

export class Include extends Component {

    static contextTypes = {
        compiler: PropTypes.instanceOf(Compiler).isRequired
    }

    declareStyles(){
        const { context, props } = this;
        const { hid, css } = props;

        context.compiler.push(hid, css.split(", "))
    }

    render(){
        this.declareStyles();
        return null
    }
}

class StyledContent extends Component {
    render(){
        return [].concat(this.props.content)
    }
}

export default class StyledApplication extends Component {

    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node
        ])
    }

    static childContextTypes = {
        compiler: PropTypes.object
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            compiler: new Compiler(this)
        }
    }

    getChildContext(){
        return {
            compiler: this.state.compiler
        };
    }

    render(){
        const { compiler } = this.state;
        const children = [].concat(this.props.children);
        //  Provider which listens to build-time placed style claims.

        return createElement(Fragment, {},
            /*
            Children of Styled Application are passed forward with style
            useage logged for subsequent style complication.

            Claims (Include) are automatically inserted at build-time
            to inform StyledApplication which styles need to be included 
            from cache. This tree-shakes the cache which contains all 
            styles computed from all required modules, application-wide, 
            which may or may not not be used for a given page build. 
            */

            ...children,

            /*
            Generated style element containing all selectors needed for given 
            page render. Output pulls style rules from cache while only
            including those which were "claimed" by elements generated within
            the StyleRegister's context.
            */
           createElement(StyledOutput, {
               compiler
           })
        )
    }
}