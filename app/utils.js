// ---- Utilities ---- //
// --- pure computation ---
import * as Values from "values.js";
import { FEATURES } from "./parameters";

export const arrInRange = N => {
  return Array.from({ length: N }, (v, k) => k);
};

export const flatten = arr => arr.reduce((acc, next) => acc.concat(next), []);

export const flattenDeep = arr =>
  arr.reduce(
    (acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next),
    []
  );

// use like this: result = a.filter(unique)
export const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

// --- color stuff ---
export const interpolateColorTintsRGB = color => {
  const valuescolor = new Values(color);
  return valuescolor
    .tints(1)
    .map(t => t.rgb)
    .map(c => [c.r, c.g, c.b]);
  // .map(c => [c.r, c.b, c.g]);
};

export const interpolateColorTints = color => {
  const valuescolor = new Values(color);
  const percentage = 1;
  // calculate the tints from percentage% to 100%
  // mapping from 'color' to white
  return valuescolor.tints(percentage).map(t => "#" + t.hex);
};

export const interpolateHexColors = (colors, v) => {
  // v is between [0, 1], mapping colors[0] to color[length-1]
  return v <= 0 ? colors[0] : v >= 1 ? "#FAFAFA" : colors[Math.floor(v * 100)];
};

export const interpolatedRGBColor = (colors, v) => {
  if (v <= 0) {
    return [250, 250, 250];
  } else if (v >= 1) {
    return colors[0];
  } else {
    return colors[Math.floor(v * 100)];
  }
};

// export const interpolatedColor = (colors, v) => {
//   if (v <= 0) {
//     return [250, 250, 250];
//   } else if (v >= 1) {
//     return colors[0];
//   } else {
//     return colors[Math.floor(v * 100)];
//   }
// };

export const rgb = colorStr => {
  return colorStr
    .slice(4, -1)
    .split(",")
    .map(i => parseInt(i));
};

export const rgba = (colorStr, alpha) => {
  return colorStr
    .slice(4, -1)
    .split(",")
    .map(i => parseInt(i))
    .concat(alpha);
};

// ---- attention computation ----
export const attn2vec = attns => {
  return attns.vec.split(" ").map((count, i) => {
    // if (i === 4 || i === 5) {
    //   // return Math.ceil(parseInt(count) / 10000) * 10000;
    //   return Math.ceil(parseInt(count) / 5000) * 5000;
    // }

    return parseInt(count);
  });
};

// ---- matrix computation ----
const binIdx = (sortedBins, binlength, value) => {
  if (value < sortedBins[0] || value > sortedBins[binlength - 1]) return -1;
  for (let i = 0; i < binlength - 1; i++) {
    if (value >= sortedBins[i] && value < sortedBins[i + 1]) {
      return i;
    }
  }
  // return binlength - 1;
  return -1;
};

export const singleDiagMatrix = (attentionVecs, attr, attrIdx) => {
  if (!attentionVecs || attentionVecs.length === 0) {
    return [];
  }

  var dictDiag = {};
  const attrLvlIdx = FEATURES.findIndex(x => x.name === attr.name);

  // Diagonal matrices
  attr.bins.forEach(lvl => {
    dictDiag[`${lvl}#${lvl}`] = 1;
  });

  attentionVecs.forEach(obj => {
    const binLength = attr.bins.length;
    const i = binIdx(attr.bins, binLength, obj.vec[attrLvlIdx]);
    // const i1 = binIdx(attrPair[1].bins, obj.vec[attr1LvlIdx]);
    if (i >= 0) {
      // value in range
      const key = `${attr.bins[i]}#${attr.bins[i]}`;
      if (dictDiag[key]) {
        dictDiag[key] += 1;
      }
    }
  });

  const matrixIdx = `${attrIdx}#${attrIdx}`;
  const cells = Object.keys(dictDiag).map(rowcol => {
    // console.log("rowcol", rowcol);
    const splits = rowcol.split("#");
    let rowId = splits[1];
    let colId = splits[0];

    return {
      id: `${matrixIdx}_${rowcol}`,
      cnt: dictDiag[rowcol],
      matId: matrixIdx,
      rowId,
      colId
    };
  });
  // console.log("cells", cells);
  return cells;
};

export const switchMatrixOption = (
  option,
  class0data,
  class1data,
  attrIdxPair
) => {
  if (
    !class0data ||
    class0data.length === 0 ||
    !class1data ||
    class1data.length === 0
  ) {
    return null;
  }

  switch (option) {
    case "class0":
      return class0data;
    case "class1":
      return class1data;
    case "difference":
      if (attrIdxPair[0] <= attrIdxPair[1]) {
        // lower triangular matrix
        return class0data.map((cell, i) => {
          return {
            ...cell,
            cnt: class1data[i].cnt - cell.cnt
          };
        });
      } else {
        //upper triangular matrix
        // console.log(attrIdxPair);
        // if (attrIdxPair[0] === 14 && attrIdxPair[1] === 13) {
        //   class0data.map((cell, i) => {
        //     console.log(
        //       "class1data[i].cnt.avg, Math.abs(class1data[i].cnt.var)",
        //       class1data[i].cnt.avg,
        //       Math.abs(class1data[i].cnt.var)
        //     );
        //   });
        // }
        return class0data.map((cell, i) => {
          return {
            ...cell,
            cnt:
              (class1data[i].cnt.avg - cell.cnt.avg) *
              Math.max(Math.abs(class1data[i].cnt.var), Math.abs(cell.cnt.var))
          };
        });
      }

    default:
      // console.log("class0data", class0data);
      // console.log("class1data", class1data);
      return class0data.map((cell, i) => {
        return {
          ...cell,
          cnt: class1data[i].cnt + cell.cnt
        };
      });
  }
};

export const sum = arr => {
  return arr.reduce((a, b) => a + b, 0);
};
export const variance = arr => {
  var m = mean(arr);
  return mean(arr.map(a => Math.pow(a - m, 2)));
};
// export const mean = arr => (sum(arr) / arr.length).toFixed(4);
export const mean = arr => sum(arr) / arr.length;

export const mean2Way = arr => {
  const minn = Math.min(...arr);
  const neg = arr.filter(x => x < 0);
  const pos = arr.filter(x => x >= 0);

  return mean(pos) + Math.abs(mean(neg));
  // return mean(arr);
};

export const entropy = arr => {
  const len = arr.length;
  const frequencies = arr.reduce(
    (freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq,
    {}
  );
  return Object.values(frequencies).reduce(
    (sum, f) => sum - (f / len) * Math.log2(f / len),
    0
  );
};

export const featuresWeightsNSort = (
  features,
  attn0Vecs,
  attn1Vecs,
  matrixRepOption
) => {
  // console.log("attn0Vecs", attn0Vecs);
  // console.log("matrixRepOption", matrixRepOption);

  const diagMats = features.map((att, attIdx) => {
    const class0DiagData = singleDiagMatrix(attn0Vecs, att, attIdx);
    // console.log("Diagonal class0DiagData", class0DiagData);
    const class1DiagData = singleDiagMatrix(attn1Vecs, att, attIdx);
    return switchMatrixOption(matrixRepOption, class0DiagData, class1DiagData, [
      attIdx,
      attIdx
    ]);
  });
  const weightedAttrOpts = features.map((attr, attrIdx) => {
    let arr = [];
    diagMats[attrIdx].forEach(c => {
      const cellid = c.id.split("_")[1].split("#");
      if (cellid[0] === cellid[1]) {
        arr.push(c.cnt);
      }
    });
    // console.log(attr);
    // console.log("arr", arr);
    // const weight = mean2Way(arr) * entropy(arr);
    // const weight = mean2Way(arr) * variance(arr);
    const weight = mean2Way(arr);
    // console.log(mean2Way(arr), variance(arr));
    return {
      ...attr,
      weight
    };
  });

  const featuresWeights = weightedAttrOpts.map(opt => opt.weight);

  const rankedAttrOpts = weightedAttrOpts.sort((a, b) => {
    return a.weight > b.weight ? -1 : a.weight > b.weight ? 1 : 0;
  });
  return rankedAttrOpts;
};

export const singleMatrixData = (
  attentionVecs,
  attrPair,
  attrIdxPair,
  range
) => {
  if (!attentionVecs || attentionVecs.length === 0) {
    return [];
  }

  const binlength0 = attrPair[0].bins.length;
  const binlength1 = attrPair[1].bins.length;

  var dict = {}; // stores intance cnt (lower triangle) or calculated temporal avg/var (upper triangle)
  const attr0LvlIdx = FEATURES.findIndex(x => x.name === attrPair[0].name);
  const attr1LvlIdx = FEATURES.findIndex(x => x.name === attrPair[1].name);

  if (attrIdxPair[0] <= attrIdxPair[1]) {
    // lower triangular matrix
    attrPair[0].bins.forEach((lvl0, i0) => {
      attrPair[1].bins.forEach((lvl1, i1) => {
        dict[`${lvl0}#${lvl1}`] = 1;
        // dict[i0 + "#" + i1] = 1;
      });
    });

    attentionVecs.forEach(obj => {
      const i0 = binIdx(attrPair[0].bins, binlength0, obj.vec[attr0LvlIdx]);
      const i1 = binIdx(attrPair[1].bins, binlength1, obj.vec[attr1LvlIdx]);
      if (i0 >= 0 && i1 >= 0) {
        // value in range
        const key = `${attrPair[0].bins[i0]}#${attrPair[1].bins[i1]}`;
        // const key = i0 + "#" + i1;
        if (dict[key]) {
          dict[key] += 1;
        }
      }
    });

    // console.log(dict);
  } else {
    // upper triagular matrix
    const vecDict = {}; // stores instance cnt for all ts, shape (T, 0)
    attrPair[0].bins.forEach((lvl0, i0) => {
      attrPair[1].bins.forEach((lvl1, i1) => {
        vecDict[`${lvl0}#${lvl1}`] = Array.from(
          // vecDict[i0 + "#" + i1] = Array.from(
          Array(range[1] - range[0] + 1),
          () => 0
        );
      });
    });

    if (range[1] === range[0]) {
      // special case: temporal length set to be 0 or 1 -> no variance
      attentionVecs.forEach(obj => {
        const key = `${obj.vec[attr0LvlIdx]}#${obj.vec[attr1LvlIdx]}`;
        if (dict[key]) {
          dict[key] += 1;
        }
        const i0 = binIdx(attrPair[0].bins, binlength0, obj.vec[attr0LvlIdx]);
        const i1 = binIdx(attrPair[1].bins, binlength1, obj.vec[attr1LvlIdx]);
        if (i0 >= 0 && i1 >= 0) {
          // value in range
          const key = `${attrPair[0].bins[i0]}#${attrPair[1].bins[i1]}`;
          // const key = i0 + "#" + i1;
          if (dict[key]) {
            dict[key] += 1;
          }
        }
      });
    } else {
      // regular case
      attentionVecs.forEach(obj => {
        const i0 = binIdx(attrPair[0].bins, binlength0, obj.vec[attr0LvlIdx]);
        const i1 = binIdx(attrPair[1].bins, binlength1, obj.vec[attr1LvlIdx]);
        if (i0 >= 0 && i1 >= 0) {
          // value in range
          const key = `${attrPair[0].bins[i0]}#${attrPair[1].bins[i1]}`;
          // const key = i0 + "#" + i1;
          // const key = `${obj.vec[attr0LvlIdx]}#${obj.vec[attr1LvlIdx]}`;
          // console.log('key', key);
          // if (
          //   vecDict[key] &&
          //   obj.pos >= range[0] - 1 &&
          //   obj.pos <= range[1] - 1
          // ) {
          //   vecDict[key][obj.pos - (range[0] - 1)] += 1;
          // }
          vecDict[key][obj.pos] += 1;
        }
      });
      Object.keys(vecDict).forEach(key => {
        dict[key] = {
          avg: sum(vecDict[key]) / vecDict[key].length,
          var: variance(vecDict[key])
        };
      });
    }
  }
  // console.log("dict", dict);

  const matrixIdx = `${attrIdxPair[0]}#${attrIdxPair[1]}`;
  const cells = Object.keys(dict).map(rowcol => {
    // console.log("rowcol", rowcol);
    const splits = rowcol.split("#");
    let rowId = splits[1];
    let colId = splits[0];

    return {
      id: `${matrixIdx}_${rowcol}`,
      cnt: dict[rowcol],
      matId: matrixIdx,
      rowId,
      colId
    };
  });
  // console.log("cells", cells);
  return cells;
};

export const singleMatrixLayout = (data, attrPair, col, row) => {
  let rowIdxDict = {};
  let colIdxDict = {};
  attrPair[0].bins.forEach((binValue, i) => (colIdxDict[binValue] = i));
  attrPair[1].bins.forEach((binValue, i) => (rowIdxDict[binValue] = i));

  return {
    id: `${col}#${row}`,
    data: data,
    rowIdx: row,
    colIdx: col,
    rowIdxDict,
    colIdxDict,
    rowAttr: attrPair[1].name,
    colAttr: attrPair[0].name,
    // numCols: Object.keys(attrPair[0].bins).length,
    // numRows: Object.keys(attrPair[1].bins).length
    numCols: attrPair[0].bins.length,
    numRows: attrPair[1].bins.length
  };
};
