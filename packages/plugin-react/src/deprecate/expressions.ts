import { isIdentifier, UnaryExpression, UpdateExpression } from '@babel/types';
import { ParseErrors } from 'errors';
import { Attribute, ElementInline, ExplicitStyle, Prop } from 'handle';

const Oops = ParseErrors({
  BadShorthandProp: "\"+\" shorthand prop must be an identifier!",
  UnrecognizedUnary: "Unary Expression {1} not recognized.",
  UnarySpaceRequired: "Unary Expression must include a space between {1} and the value.",
  MinusMinusNotImplemented: "-- is not implemented as an integration statement."
})

export function handleUpdateExpression(
  this: ElementInline,
  node: UpdateExpression){

  const value = node.argument;
  const op = node.operator;

  if(node.start !== value.start! - 3)
    throw Oops.UnarySpaceRequired(node, op)

  if(op !== "++")
    throw Oops.MinusMinusNotImplemented(node)

  this.add(
    new Prop(false, value)
  )
}

export function handleUnaryExpression(
  this: ElementInline,
  node: UnaryExpression){

  const value = node.argument;
  const op = node.operator

  switch(op){
    case "delete":
      this.ExpressionAsStatement(value);
      return

    case "void":
    case "!":
      this.ExpressionDefault(node)
      return
  }

  if(node.start !== value.start! - 2)
    throw Oops.UnarySpaceRequired(node, op);

  let insert: Attribute;

  switch(op){
    case "+":
      if(!isIdentifier(value))
        throw Oops.BadShorthandProp(node);
      insert = new Prop(value.name, value);
    break;

    case "-":
      insert = new Prop("className", value);
    break;

    case "~":
      insert = new ExplicitStyle(false, value);
    break;

    default:
      throw Oops.UnrecognizedUnary(node, op);
  }

  this.add(insert);
}