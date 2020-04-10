import { handleActions } from "redux-actions";

import {
  LOAD_PROPERTY,
  LOAD_ATTENTION,
  LOAD_SEQUENCE,
  UPDATE_LASSO_SELECTED_INSTANCE_ID,
  UPDATE_SELECTED_CLASS,
  UPDATE_SELECTED_AGE,
  UPDATE_SELECTED_GENDER,
  UPDATE_SELECTED_MODEL,
  UPDATE_SELECTED_EPOCH,
  UPDATE_SELECTED_ATTN_RANGE,
  UPDATE_SELECTED_MATRIX,
  UPDATE_FEATURE_NUMBER,
  UPDATE_CLUSTER_NUMBER,
  UPDATE_ESTIMATED_CLUSTER_NUMBER,
  UPDATE_NOISE_REDUCTION_LVL,
  UPDATE_SEQUENCE_TIME_BRUSH,
  CLOSE_SEQUENCE_VIEW
} from "./actions";

import { flattenDeep, unique } from "./utils";
import { FEATURES } from "./parameters";

// ----  Reducers ---- // (reduce to new state)
// Redux root state tree
const DEFAULT_STATE = {
  property: [],
  attention: [],
  sequence: [],
  features: FEATURES,
  rankedFeatures: FEATURES,
  selectedInstanceId: [],
  selectedClass: [],
  selectedAge: [],
  selectedGender: [],
  selectedFeatureIdx: [2],
  selectedModel: null,
  selectedEpoch: null,
  selectedAttnRange: [],
  selectedLassoId: [],
  selectedMatrixId: null,
  selectedFeatureNumber: 15,
  selectedClusterNumber: 2,
  estimatedClusterNumber: null,
  selectedSequenceTimeBrush: [0, 47],
  selectedNoiseReductionLvl: 0.2
};

const handleLoadProperty = (state, { payload }) => {
  // (state, action) => get payload from action  => (state, {payload})
  // console.log("handleLoadProperty", payload);
  return {
    ...state,
    property: payload
  };
};

const handleLoadAttention = (state, { payload }) => {
  const { attention } = payload;
  return {
    ...state,
    attention
  };
};

const handleLoadSequence = (state, { payload }) => {
  // console.log("handleLoadSequence", payload);
  return {
    ...state,
    sequence: payload
  };
};

const handleUpdateSelectedClass = (state, { payload }) => {
  return {
    ...state,
    selectedClass: payload
  };
};
const handleUpdateSelectedAge = (state, { payload }) => {
  return {
    ...state,
    selectedAge: payload
  };
};
const handleUpdateSelectedGender = (state, { payload }) => {
  return {
    ...state,
    selectedGender: payload
  };
};
// const handleUpdateSelectedFeatureIdx = (state, { payload }) => {
//   console.log("handleUpdateSelectedFeatureIdx", payload);
//   return {
//     ...state,
//     selectedFeatureIdx: payload
//   };
// };
const handleUpdateSelectedModel = (state, { payload }) => {
  return {
    ...state,
    selectedModel: payload
  };
};
const handleUpdateSelectedEpoch = (state, { payload }) => {
  return {
    ...state,
    selectedEpoch: payload
  };
};
const handleUpdateSelectedAttnRange = (state, { payload }) => {
  const attnRangeArr = flattenDeep(
    payload
      .map(o => {
        // return o.split("-").map(s => parseFloat(s)); // both start and end
        return parseFloat(o.split("-")[0]); // only start
      })
      .sort()
  );

  return {
    ...state,
    // selectedAttnRange: flattenDeep(tmp).filter(unique)
    selectedAttnRange: attnRangeArr
  };
};

const handleUpdateLassoSelectedInstanceId = (state, { payload }) => {
  // console.log("handleUpdateLassoSelectedInstanceId", payload);
  return {
    ...state,
    selectedInstanceId: payload
  };
};

const handleUpdateSelectedMatrix = (state, { payload }) => {
  // console.log("handleUpdateSelectedMatrix", payload);

  return {
    ...state,
    selectedMatrixId: payload
  };
};

const handleUpdateFeatureNumber = (state, { payload }) => {
  return {
    ...state,
    selectedFeatureNumber: payload.target.value
  };
};

const handleUpdateClusterNumber = (state, { payload }) => {
  return {
    ...state,
    selectedClusterNumber: payload
  };
};

const handleUpdateEstimatedClusterNumber = (state, { payload }) => {
  return {
    ...state,
    estimatedClusterNumber: payload,
    selectedClusterNumber: payload
  };
};

const handleUpdateNoiseReductionLvl = (state, { payload }) => {
  return {
    ...state,
    selectedNoiseReductionLvl: payload
  };
};

const handleUpdateSequenceTimeRush = (state, { payload }) => {
  return {
    ...state,
    selectedSequenceTimeBrush: [payload.startIndex, payload.endIndex]
  };
};

const handleCloseSequenceView = (state, { payload }) => {
  return {
    ...state,
    selectedMatrixId: null
  };
};

// map action ID to functions
// const matrixReducer = handleActions(
export default handleActions(
  {
    [LOAD_PROPERTY]: handleLoadProperty, // when LOAD_PROPERTY is called, it triggers handleLoadProperty. // defination
    [LOAD_ATTENTION]: handleLoadAttention,
    [LOAD_SEQUENCE]: handleLoadSequence,
    [UPDATE_SELECTED_CLASS]: handleUpdateSelectedClass,
    [UPDATE_SELECTED_AGE]: handleUpdateSelectedAge,
    [UPDATE_SELECTED_GENDER]: handleUpdateSelectedGender,
    // [UPDATE_SELECTED_FEATURE_IDX]: handleUpdateSelectedFeatureIdx,
    [UPDATE_SELECTED_MODEL]: handleUpdateSelectedModel,
    [UPDATE_SELECTED_EPOCH]: handleUpdateSelectedEpoch,
    [UPDATE_SELECTED_ATTN_RANGE]: handleUpdateSelectedAttnRange,
    [UPDATE_LASSO_SELECTED_INSTANCE_ID]: handleUpdateLassoSelectedInstanceId,
    [UPDATE_SELECTED_MATRIX]: handleUpdateSelectedMatrix,
    [UPDATE_FEATURE_NUMBER]: handleUpdateFeatureNumber,
    [UPDATE_CLUSTER_NUMBER]: handleUpdateClusterNumber,
    [UPDATE_ESTIMATED_CLUSTER_NUMBER]: handleUpdateEstimatedClusterNumber,
    [UPDATE_NOISE_REDUCTION_LVL]: handleUpdateNoiseReductionLvl,
    [UPDATE_SEQUENCE_TIME_BRUSH]: handleUpdateSequenceTimeRush,
    [CLOSE_SEQUENCE_VIEW]: handleCloseSequenceView
  },
  DEFAULT_STATE // initial state
);