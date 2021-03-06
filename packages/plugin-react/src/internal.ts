// internal module pattern
// control load order to prevent skullduggery, also cleaner
// https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de

export const opts = {} as any;

export * from "translate/attributes";
export * from "translate/element";
export * from "translate/switch";
export * from "translate/iterate";
export * from "generate/syntax";
export * from "generate/element";
export * from "generate/es5";
export * from "generate/jsx";
export * from "regenerate/component";
export * from "regenerate/module";
export * from "regenerate/scope";
export * from "regenerate/style";
