import { createSelector } from "reselect";

import { getAttention, getSelectedAttnRange } from "./base";
import { attn2vec } from "../utils";

export const getAttnRangeFilteredAttention = createSelector(
  [getSelectedAttnRange, getAttention],
  (selectedRange, attention) => {
    if (!attention || attention.length == 0) {
      return null;
    }
    if (!selectedRange.length) {
      return attention;
    }

    let attnRangeFiltered = [];
    selectedRange.forEach(rangeStart => {
      const currAttns = attention.filter(atts => {
        return atts.attn >= rangeStart && atts.attn <= rangeStart + 0.1;
      });

      attnRangeFiltered = attnRangeFiltered.concat(currAttns);
    });

    return attnRangeFiltered;
  }
);

export const getAttentionByClass = createSelector(
  getAttnRangeFilteredAttention,
  attention => {
    if (!attention || !attention.length) {
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