import { createSelector } from "reselect";

//  ---- Selectors  ---- //
const rootSelector = state => state;

export const getData = createSelector(rootSelector, state => {
  return state.property;
});

export const getAttention = createSelector(rootSelector, state => {
  return state.attention;
});

export const getSequence = createSelector(rootSelector, state => {
  return state.sequence;
});

export const getSelectedAttnRange = createSelector(rootSelector, state => {
  return state.selectedAttnRange;
});

export const getFeatures = createSelector(rootSelector, state => {
  // console.log("state.features", state.features);
  return state.features;
});

export const getSelectedMatrixId = createSelector(
  rootSelector,
  state => state.selectedMatrixId
);

export const getSelectedFeatureNumber = createSelector(
  rootSelector,
  state => state.selectedFeatureNumber
);
