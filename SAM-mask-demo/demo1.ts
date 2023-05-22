import { log } from "console";
import { points2SVG, traceOnnxMaskToPath } from "./mask_util";

let arr = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const svgstr = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none">';
const ret = traceOnnxMaskToPath(new Uint8Array(arr), 11, 10);
const pathList = ret.map(v => `<path d="${points2SVG(v)}" fill="#FF8C02"/>`)
log(svgstr + pathList.join('') + '</svg>')