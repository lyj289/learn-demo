/**
 * Functions for handling and tracing masks.
 */

import { generatePolygonSegments, convertSegmentsToPathList } from './mask_tracer';

export type Point = [x: number, y: number];
export type Path = [Point];

export enum LabelMaskEnum {
  OBSTACLE = 10,
  BUILDING = 20,
  TREE = 30,
  WALL = 40,
  SKY = 50,
  GROUND = 60,
  SIDEWALK = 70,
  LANELINE = 80,
  POLE = 90,
  SIGNAL = 100,
  SIGN = 110,
  ZOI = 120,
  STOPLINE = 130,
  CROSSWALK = 140,
  CAR_COVER = 150,
}

export const LabelMaskColor = {
  [LabelMaskEnum.OBSTACLE]: '#ae2d18',
  [LabelMaskEnum.BUILDING]: '#e1feb5',
  [LabelMaskEnum.TREE]: '#1eff1e',
  [LabelMaskEnum.WALL]: '#eef81c',
  [LabelMaskEnum.SKY]: '#001eff',
  [LabelMaskEnum.GROUND]: '#77a07a',
  [LabelMaskEnum.SIDEWALK]: '#1cdfd0',
  [LabelMaskEnum.LANELINE]: '#292b7',
  [LabelMaskEnum.POLE]: '#A16207',
  [LabelMaskEnum.SIGNAL]: '#E11D48',
  [LabelMaskEnum.SIGN]: '#4ADE80',
  [LabelMaskEnum.ZOI]: '#f26216',
  [LabelMaskEnum.STOPLINE]: '#ffffff',
  [LabelMaskEnum.CROSSWALK]: '#FDE047',
  [LabelMaskEnum.CAR_COVER]: '#e7e6e2',
} as const;

/**
 * Converts mask array into RLE array using the fortran array
 * format where rows and columns are transposed. This is the
 * format used by the COCO API and is expected by the mask tracer.
 * @param {Array<number>} input
 * @param {number} nrows height
 * @param {number} ncols width
 * @returns array of integers
 */
export function maskDataToFortranArrayToRle(input: any, nrows: number, ncols: number) {
  const result = [];
  let count = 0;
  let bit = false;
  for (let c = 0; c < ncols; c++) {
    for (let r = 0; r < nrows; r++) {
      var i = c + r * ncols;
      if (i < input.length) {
        const filled = input[i] > 0.0;
        if (filled !== bit) {
          result.push(count);
          bit = !bit;
          count = 1;
        } else count++;
      }
    }
  }
  if (count > 0) result.push(count);
  return result;
}

/**
 * Converts RLE Array into SVG data as a single string.
 * @param {Float32Array<number>} rleMask
 * @param {number} height
 * @returns {Path[]}
 */
export const traceRleToPath = (
  rleMask:
    | Array<number>
    | string[]
    | Uint8Array
    | Float32Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Int32Array
    | BigInt64Array
    | Float64Array
    | Uint32Array
    | BigUint64Array,
  height: number
) => {
  const polySegments = generatePolygonSegments(rleMask, height);
  return convertSegmentsToPathList(polySegments);
};

export const getAllMasks = (maskData: any, height: number, width: number) => {
  let masks = [];
  for (let m = 0; m < 4; m++) {
    let nthMask = new Float32Array(height * width);
    const offset = m * width * height;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        var idx = i * width + j;
        if (idx < width * height) {
          nthMask[idx] = maskData[offset + idx];
        }
      }
    }
    masks.push(nthMask);
  }
  return masks;
};

export const getBestPredMask = (maskData: any, height: number, width: number, index: number) => {
  let nthMask = new Float32Array(height * width);
  const offset = index * width * height;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      var idx = i * width + j;
      if (idx < width * height) {
        nthMask[idx] = maskData[offset + idx];
      }
    }
  }
  // const bestMask = new Tensor('float32', nthMask, [1, 1, width, height]);
  // return bestMask;
};

function areaUnderLine(x0: number, y0: number, x1: number, y1: number) {
  // A vertical line has no area
  if (x0 === x1) return 0;
  // Square piece
  const ymin = Math.min(y0, y1);
  const squareArea = (x1 - x0) * ymin;
  // Triangle piece
  const ymax = Math.max(y0, y1);
  const triangleArea = Math.trunc(((x1 - x0) * (ymax - ymin)) / 2);
  return squareArea + triangleArea;
}

function svgCoordToInt(input: string) {
  if (input.charAt(0) === 'L' || input.charAt(0) === 'M') {
    return parseInt(input.slice(1));
  }
  return parseInt(input);
}

export function areaOfSVGPolygon(input: string) {
  let coords = input.split(' ');
  if (coords.length < 4) return 0;
  if (coords.length % 2 != 0) return 0;
  let area = 0;
  // We need to close the polygon loop, so start with the last coords.
  let old_x = svgCoordToInt(coords[coords.length - 2]);
  let old_y = svgCoordToInt(coords[coords.length - 1]);
  for (let i = 0; i < coords.length; i = i + 2) {
    let new_x = svgCoordToInt(coords[i]);
    let new_y = svgCoordToInt(coords[i + 1]);
    area = area + areaUnderLine(old_x, old_y, new_x, new_y);
    old_x = new_x;
    old_y = new_y;
  }
  return area;
}

export function areaOfPolygon(points: Point[]) {
  if (points.length < 2) return 0;
  let area = 0;

  // We need to close the polygon loop, so start with the last coords.
  let [old_x, old_y] = points[points.length - 1];
  for (let i = 0; i < points.length; i = i + 1) {
    let [new_x, new_y] = points[i];
    area = area + areaUnderLine(old_x, old_y, new_x, new_y);
    old_x = new_x;
    old_y = new_y;
  }
  return area;
}

/**
 * Filters SVG edges that enclose an area smaller than maxRegionSize.
 * Expects a list over SVG strings, with each string in the format:
 * 'M<x0> <y0> L<x1> <y1> <x2> <y2> ... <xn-1> <yn-1>'
 * The area calculation is not quite exact, truncating fractional pixels
 * instead of rounding. Both clockwise and counterclockwise SVG edges
 * are filtered, removing stray regions and small holes. Always keeps
 * at least one positive area region.
 */
export function filterSmallPathRegions(input: Path[], maxRegionSize: number = 100) {
  const filtered_regions = input.filter(
    (region: Path) => Math.abs(areaOfPolygon(region)) > maxRegionSize
  );
  if (filtered_regions.length === 0) {
    const areas = input.map((region: Path) => areaOfPolygon(region));
    const bestIdx = areas.indexOf(Math.max(...areas));
    return [input[bestIdx]];
  }
  return filtered_regions;
}

/**
 * Converts onnx model output into SVG data as a single string
 * @param {Float32Array<number>} maskData
 * @param {number} height
 * @param {number} width
 * @returns {Path[]}
 */
export const traceOnnxMaskToPath = (
  maskData:
    | string[]
    | Uint8Array
    | Uint8ClampedArray
    | Float32Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Int32Array
    | BigInt64Array
    | Float64Array
    | Uint32Array
    | BigUint64Array,
  height: number,
  width: number
) => {
  const rleMask = maskDataToFortranArrayToRle(maskData, height, width);
  let paths = traceRleToPath(rleMask, height);
  if (paths.length) {
    // paths = filterSmallPathRegions(paths);
  }
  return paths;
};

/**
 * Converts compressed RLE string into SVG
 * @param {string} maskString
 * @param {number} height
 * @returns {Path[]}
 */
export const traceCompressedRLeStringToSVG = (maskString: string | null, height: number) => {
  const rleMask = rleFrString(maskString);
  let paths = traceRleToPath(rleMask, height);
  paths = filterSmallPathRegions(paths);
  return paths;
};

/**
 * Parses RLE from compressed string
 * @param {Array<number>} input
 * @returns array of integers
 */
export const rleFrString = (input: any) => {
  let result = [];
  let charIndex = 0;
  while (charIndex < input.length) {
    let value = 0,
      k = 0,
      more = 1;
    while (more) {
      let c = input.charCodeAt(charIndex) - 48;
      value |= (c & 0x1f) << (5 * k);
      more = c & 0x20;
      charIndex++;
      k++;
      if (!more && c & 0x10) value |= -1 << (5 * k);
    }
    if (result.length > 2) value += result[result.length - 2];
    result.push(value);
  }
  return result;
};

export const points2SVG = (points: Point[]) => {
  // Build the SVG data string for this path
  const stringPoints = points
    .slice(1)
    .map(([x, y]) => `${x} ${y}`)
    .join(' ');
  const svgStr = `M${points[0][0]} ${points[0][1]} L` + stringPoints;
  return svgStr; // Add to final SVG string return value
};

function toImageData(input: any, width: number, height: number) {
  const [r, g, b, a] = [0, 114, 189, 255];
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

export function imageDataToMaskDataByPixelValue(input: any, width: number, height: number) {
  const maskMap = new Map();
  const fullMaskArray = imageDataToMaskData(input, width, height);
  const maskValues = Array.from(new Set(fullMaskArray)).filter((v) => v > 0);
  console.log('Mask values in image are: ', maskValues);
  for (const pv of maskValues) {
    const pvArr = fullMaskArray.map((v) => (v === pv ? v : 0));
    maskMap.set(pv, pvArr);
  }
  return maskMap;
}

export function imageDataToMaskData(input: any, width: number, height: number) {
  const arr = new Uint8ClampedArray(width * height).fill(0);
  for (let i = 0; i < arr.length; i++) {
    const pv = input[i * 4];
    if (pv > 0.0 && pv % 10 == 0) {
      arr[i] = pv;
    }
  }
  return arr;
}

function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}

export function rleToImage(input: any, width: number, height: number) {
  return imageDataToImage(toImageData(input, width, height));
}

export function rleToCanvas(input: any, width: number, height: number) {
  return imageDataToCanvas(toImageData(input, width, height));
}

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(input: any, width: number, height: number) {
  return imageDataToImage(toImageData(input, width, height));
}

// Returns a boolean array for which masks to keep in the multi-mask
// display, given uncertain IoUs and overlap IoUs.
export function keepArrayForMultiMask(
  uncertainIoUs: number[],
  overlapIoUs: number[],
  uncertainThresh: number = 0.8,
  overlapThresh: number = 0.9
) {
  let keepArray = uncertainIoUs.map((iou: number) => iou > uncertainThresh);
  const duplicateArray = overlapIoUs.map((iou: number) => iou < overlapThresh);
  keepArray = keepArray.map((val: boolean, i: number) => val && duplicateArray[i]);
  // If all masks fail tests, keep just the best one
  if (keepArray.every((item) => item === false)) {
    const bestIdx = uncertainIoUs.indexOf(Math.max(...uncertainIoUs));
    keepArray[bestIdx] = true;
  }
  return keepArray;
}
