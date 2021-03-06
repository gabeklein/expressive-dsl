import { rect } from "./util"

const INVERSE = {
  top: "bottom",
  left: "right",
  right: "left",
  bottom: "top"
}

export function absolute(...args){
  return {
    style: { position: "absolute" },
    attrs: computePosition(...args)
  }
}

export function fixed(...args){
  return {
    style: { position: "fixed" },
    attrs: computePosition(...args)
  }
}

export function relative(){
  return {
    style: { position: "relative" }
  };
}

function computePosition(a, b = 0, c = b){
  let keyword;

  let out = {
    top: b,
    left: c,
    right: c,
    bottom: b
  };

  if(a == "fill")
    return out;

  if(typeof a == "string"){
    const [k1, k2] = a.split("-");

    if(k2){
      if(k1 == "fill")
        delete out[INVERSE[k2]]

      else for(const dir of [k1, k2])
        delete out[INVERSE[dir]]

      return out
    }
  }

  return position(...arguments)
}

function position(){
  let data = {};

  if(typeof a != "number")
    for(const item of arguments)
      if(item.named)
        data[item.named] = item.inner[0]
      else {
        data = null;
        break;
      }

  if(!data){
    const [ top, right, bottom, left ] = rect(...arguments);
    return { top, right, bottom, left };
  }

  return data;
}