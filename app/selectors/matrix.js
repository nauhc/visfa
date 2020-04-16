import { createSelector } from "reselect";
import {
  getFeatures,
  getSelectedMatrixId,
  getSelectedFeatureNumber
} from "./base";
import { getAttentionByClass } from "./attention";
import {
  singleDiagMatrix,
  singleMatrixData,
  singleMatrixLayout,
  switchMatrixOption,
  flattenDeep,
  featuresWeightsNSort
} from "../utils";
import { TEMPORAL_LENGTH } from "../parameters";

export const getRankedFeatures = createSelector(
  [
    getAttentionByClass,
    getFeatures
    // getMatrixRepresentationOption,
    // getTempPosRangeSliderValue
  ],
  // (attention, features, matrixRepOption, tempRange) => {
  (attention, features) => {
    // --- take-in data ---
    // attention: original data in two arrays [negatives, positives].
    // features: what features to show == FEATURES (constants.js) if loading all features.
    // matrixRepOption: Positive/Negative/Difference.
    // tempRange: what temporal range to show [default 1-48].
    if (!attention || !attention.length) {
      return null;
    }

    const [attn0Vecs, attn1Vecs] = attention;

    // === sort features ===
    const rankedFeatures = featuresWeightsNSort(
      features,
      attn0Vecs,
      attn1Vecs,
      "difference"
    );
    // console.log("rankedFeatures", rankedFeatures);
    return rankedFeatures;
  }
);

export const getSelectedFeatureId = createSelector(
  [getSelectedMatrixId, getFeatures, getRankedFeatures],
  (matId, features, rankedFeatures) => {
    if (!matId || rankedFeatures.length === 0) {
      return null;
    }
    const selectedFeatureName = rankedFeatures[parseInt(matId)].name;
    const selectedOrgFeatureId = features
      .map(f => f.name)
      .indexOf(selectedFeatureName);
    return [selectedOrgFeatureId];
  }
);

const getRankedSelectedFeatures = createSelector(
  [getRankedFeatures, getSelectedFeatureNumber],
  (rankedFeatures, selectedFeatureNumber) => {
    if (!rankedFeatures || rankedFeatures.length === 0) {
      return null;
    }
    return rankedFeatures.slice(0, selectedFeatureNumber);
  }
);

const getMatrixGridData2D = createSelector(
  [
    getAttentionByClass,
    getRankedSelectedFeatures
    // getMatrixRepresentationOption,
    // getTempPosRangeSliderValue
  ],
  // (attention, rankedFeatures, matrixRepOption, tempRange) => {
  (attention, selectedFeatures) => {
    if (!attention || !attention.length || !selectedFeatures.length) {
      return null;
    }
    // --- take-in data ---
    // attention: original data in two arrays [negatives, positives].
    // attrOpts: what features to show == FEATURES (constants.js) if loading all features.
    // matrixRepOption: Positive/Negative/difference.
    // tempRange: what temporal range to show [default 1-48].

    // console.log("attention", attention);
    // console.log("attrOpts", attrOpts);
    // console.log("matrixRepOption", matrixRepOption);
    // console.log("tempRange", tempRange);
    const [attn0Vecs, attn1Vecs] = attention;
    // console.log("attn0Vecs", attn0Vecs);
    // console.log("rankedFeatures", rankedFeatures);

    return selectedFeatures.map((attCol, col) => {
      return selectedFeatures.map((attRow, row) => {
        // console.log("attCol", "attRow", attCol.name, attRow.name, col, row);
        // return [attCol, attRow];
        // console.log("attCol, attRow", attCol, attRow);
        const class0data = singleMatrixData(
          attn0Vecs,
          [attCol, attRow],
          [col, row],
          [0, TEMPORAL_LENGTH - 1]
        );

        const class1data = singleMatrixData(
          attn1Vecs,
          [attCol, attRow],
          [col, row],
          [0, TEMPORAL_LENGTH - 1]
        );

        const data = switchMatrixOption("difference", class0data, class1data, [
          col,
          row
        ]);
        // console.log("class0data", class0data);
        // console.log("data", data);
        // matrix is {matId, data, rowIdx(levels in row), colIdx(levels in col),
        // rowAttr(attribute name), colAttr(attribute name), numCols, num}

        const matrix = singleMatrixLayout(data, [attCol, attRow], col, row);
        // console.log("matrix", matrix);
        // console.log(matrix.data.map(c => c.cnt));
        // console.log("attrWeights", attrWeights);
        return matrix;
      });
    });
  }
);

// flatten matrix and add labels
export const getMatrixGrid = createSelector(
  [getMatrixGridData2D, getRankedSelectedFeatures],
  (matrices, selectedFeatures) => {
    if (!matrices || !matrices.length || selectedFeatures.length === 0) {
      return null;
    }

    const flattenedMatrixGrid = flattenDeep(matrices);
    // console.log("flattenedMatrixGrid", flattenedMatrixGrid);
    // flattenedMatrixGrid.map(m => console.log(m.id));
    // console.log("matrices", matrices);

    return {
      // matrixGrid: sortedFlattentedMatrixGrid,
      // labels: rankedFeatures
      matrixGrid: flattenedMatrixGrid,
      labels: selectedFeatures
    };
  }
);
