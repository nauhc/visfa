import { createAction } from "redux-actions";

// ---- Actions ---- //
// ACTION TYPE/ID
export const LOAD_PROPERTY = "LOAD_PROPERTY";
export const LOAD_ATTENTION = "LOAD_ATTENTION";
export const LOAD_SEQUENCE = "LOAD_SEQUENCE";
export const UPDATE_LASSO_SELECTED_INSTANCE_ID =
  "UPDATE_LASSO_SELECTED_INSTANCE_ID";
export const UPDATE_SELECTED_CLASS = "UPDATE_SELECTED_CLASS";
export const UPDATE_SELECTED_AGE = "UPDATE_SELECTED_AGE";
export const UPDATE_SELECTED_GENDER = "UPDATE_SELECTED_GENDER";
export const UPDATE_SELECTED_FEATURE_IDX = "UPDATE_SELECTED_FEATURE_IDX";
export const UPDATE_SELECTED_MODEL = "UPDATE_SELECTED_MODEL";
export const UPDATE_SELECTED_EPOCH = "UPDATE_SELECTED_EPOCH";
export const UPDATE_SELECTED_ATTN_RANGE = "UPDATE_SELECTED_ATTN_RANGE";
export const UPDATE_SELECTED_MATRIX = "UPDATE_SELECTED_MATRIX";
export const UPDATE_FEATURE_NUMBER = "UPDATE_FEATURE_NUMBER";
export const UPDATE_CLUSTER_NUMBER = "UPDATE_CLUSTER_NUMBER";
export const UPDATE_ESTIMATED_CLUSTER_NUMBER =
  "UPDATE_ESTIMATED_CLUSTER_NUMBER";
export const UPDATE_NOISE_REDUCTION_LVL = "UPDATE_NOISE_REDUCTION_LVL";
export const UPDATE_SEQUENCE_TIME_BRUSH = "CHANGE_SEQUENCE_TIME_BRUSH";
export const CLOSE_SEQUENCE_VIEW = "CLOSE_SEQUENCE_VIEW";

// ACTIONS
export const loadProperty = createAction(LOAD_PROPERTY);
export const loadAttention = createAction(LOAD_ATTENTION);
export const loadSequence = createAction(LOAD_SEQUENCE);
export const updateLassoSelectedInstanceId = createAction(
  UPDATE_LASSO_SELECTED_INSTANCE_ID
);
export const updateSelectedClass = createAction(UPDATE_SELECTED_CLASS);
export const updateSelectedAge = createAction(UPDATE_SELECTED_AGE);
export const updateSelectedGender = createAction(UPDATE_SELECTED_GENDER);
export const updateSelectedFeatureIdx = createAction(
  UPDATE_SELECTED_FEATURE_IDX
);
export const updateSelectedModel = createAction(UPDATE_SELECTED_MODEL);
export const updateSelectedEpoch = createAction(UPDATE_SELECTED_EPOCH);
export const updateSelectedAttnRange = createAction(UPDATE_SELECTED_ATTN_RANGE);
export const updateSelectedMatrix = createAction(UPDATE_SELECTED_MATRIX);
export const updateFeatureNumber = createAction(UPDATE_FEATURE_NUMBER);
export const updateClusterNumber = createAction(UPDATE_CLUSTER_NUMBER);
export const updateEstimatedClusterNumber = createAction(
  UPDATE_ESTIMATED_CLUSTER_NUMBER
);
export const updateNoiseReductionLvl = createAction(UPDATE_NOISE_REDUCTION_LVL);
export const updateSequenceTimeBrush = createAction(UPDATE_SEQUENCE_TIME_BRUSH);
export const closeSequenceView = createAction(CLOSE_SEQUENCE_VIEW);

// thunk async call
export const updateAndFetchProperty = data => {
  return dispatch => {
    fetch("http://localhost:5000/visfa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: data
    })
      .then(res => {
        return res.json();
      })
      .then(d => {
        dispatch(loadProperty(d));
      })
      .catch(err => console.log(err));
  };
};

export const updateAndFetchSequences = data => {
  return dispatch => {
    fetch("http://localhost:5000/norce", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: data
    })
      .then(res => {
        return res.json();
      })
      .then(d => {
        dispatch(loadSequence(d));
      })
      .catch(err => console.log(err));
  };
};
