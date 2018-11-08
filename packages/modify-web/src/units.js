const EXPORT = exports;

import { appendUnitToN } from './util';

for(const style of [
    "top",
    "left",
    "right",
    "bottom",
    "width",
    "height",
    "maxWidth",
    "maxHeight",
    "minWidth",
    "minHeight",
    "fontSize",
    "lineHeight",
    "outlineWidth",
    "borderRadius",
    "backgroundSize"
]) 
EXPORT[style] = nToNUnits;

function nToNUnits(value, unit) {
    if(value.named){
        unit = value.named;
        value = value.inner[0]
    }
    return {
        style: {
            [this.name]: appendUnitToN(value, unit)
        }
    }
}

