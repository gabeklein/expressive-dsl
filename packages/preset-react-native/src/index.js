import transformReactClass      from "@expressive/babel-plugin-react-class";
import transformReactXJS from "@expressive/babel-plugin-react-xjs";
import ExpressiveEnhancements from "babel-preset-expressive-enhancements"

const NativeStyles = require("@expressive/react-modifiers");

const Plugins = require("babel-preset-react-native/plugins")

function plugin(name) {
    const imported = Plugins[`babel-plugin-${name}`]
    return imported.default || imported;
}

module.exports = options => {
    return {
        presets: [
            ExpressiveEnhancements
        ],
        plugins: [

            plugin('syntax-trailing-function-commas'),
            plugin('transform-es2015-block-scoping'),
            plugin('transform-es2015-computed-properties'),
            plugin('transform-es2015-destructuring'),
            plugin('transform-es2015-function-name'),
            plugin('transform-es2015-literals'),
            plugin('transform-es2015-shorthand-properties'),
            plugin('transform-flow-strip-types'),
            plugin('transform-react-jsx'),
            plugin('transform-regenerator'),
            [
              plugin('transform-es2015-modules-commonjs'),
              {strict: false, allowTopLevelThis: true},
            ],
            plugin('transform-es2015-parameters'),
            plugin('transform-class-properties'),
            plugin('syntax-async-functions'),
            plugin('transform-es2015-arrow-functions'),
            plugin('check-es2015-constants'),
            plugin('transform-es2015-spread'),
            plugin('transform-object-rest-spread'),
            plugin('transform-es2015-template-literals'),
            plugin('transform-object-assign'),
            
            
            [transformReactClass, {
                activeOnMethodDo: true
            }],
            [transformReactXJS, {
                reactEnv: "native",
                output: "es6",
                styleMode: "compile",
                modifiers: [
                    NativeStyles
                ]
            }],

            plugin('transform-es2015-classes'),
            
            //TODO: implement transform-react-display-nam
            //TODO: implement transform-react-jsx-source
        ]
    }
}