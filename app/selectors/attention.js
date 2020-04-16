import { createSelector } from "reselect";

import {
  getAttention,
  getSelectedAttnRange,
  getSelectedAttnPercentile,
  getSelectedAttnPercentileSwitch
} from "./base";
import { attn2vec } from "../utils";

const getPercentileFilteredAttention = createSelector(
  [getAttention, getSelectedAttnPercentile],
  (attention, selectedPercentile) => {
    if (!attention || attention.length == 0) {
      return null;
    }
    if (!selectedPercentile.length) {
      return attention;
    }
    // filter by selected percentile
    let attnPercentFiltered = [];
    selectedPercentile.forEach(obj => {
      const range = obj.y;
      const currAttns = attention.filter(atts => {
        return atts.attn >= range[0] && atts.attn <= range[1];
      });
      attnPercentFiltered = attnPercentFiltered.concat(currAttns);
    });
    return attnPercentFiltered;
  }
);

const getRangeFilteredAttention = createSelector(
  [getAttention, getSelectedAttnRange],
  (attention, selectedRange) => {
    if (!attention || attention.length == 0) {
      return null;
    }
    if (!selectedRange.length) {
      return attention;
    }
    // filter by selected range
    let attnRangeFiltered = [];
    selectedRange.forEach(obj => {
      const rangeStart = parseFloat(obj.x.split("-")[0]);
      const currAttns = attention.filter(atts => {
        return atts.attn >= rangeStart && atts.attn <= rangeStart + 0.1;
      });

      attnRangeFiltered = attnRangeFiltered.concat(currAttns);
    });
    return attnRangeFiltered;
  }
);

export const getAttnRangeFilteredAttention = createSelector(
  [
    getRangeFilteredAttention,
    getPercentileFilteredAttention,
    getSelectedAttnPercentileSwitch
  ],
  (rangeFilteredAttn, percentileFilteredAttn, percentileSwitch) => {
    if (percentileSwitch) {
      return percentileFilteredAttn;
    } else {
      return rangeFilteredAttn;
    }
  }
);

export const getAttentionByClass = createSelector(
  getAttnRangeFilteredAttention,
  attention => {
    if (!attention || attention.length === 0) {
      return null;
    }
    return [0, 1].map(classId =>
      // TODO should avoid using 'class' as attribute name
      attention.filter(attn => attn.class === classId).map(attn => ({
        pos: attn.posId,
        seq: attn.seqId,
        vec: attn2vec(attn)
      }))
    );
  }
);
