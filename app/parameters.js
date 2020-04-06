// featues (no variation removed) are calculated seperately in the oulad_pytorch project
export const TEMPORAL_LENGTH = 180;
export const FEATURES = [
  { name: "resource", range: [0, 1841], bins: [0, 1, 2, 3] },
  { name: "oucontent", range: [0, 608], bins: [0, 1, 4, 10, 22] },
  { name: "url", range: [0, 38], bins: [0, 1, 2] },
  { name: "ouwiki", range: [0, 181], bins: [0, 1, 2, 5] },
  { name: "quiz", range: [0, 1879], bins: [0, 1, 7, 25, 66] },
  { name: "dataplus", range: [0, 56], bins: [0, 1, 3, 5, 8] },
  { name: "glossary", range: [0, 73], bins: [0, 1, 3, 7] },
  { name: "folder", range: [0, 7], bins: [0, 1] },
  { name: "subpage", range: [0, 287], bins: [0, 1, 2, 3, 6] },
  { name: "forumng", range: [0, 268], bins: [0, 1, 3, 5, 11] },
  { name: "repeatactivity", range: [0, 4], bins: [0.0, 3.0, 4.0] },
  { name: "questionnaire", range: [0, 25], bins: [0, 1, 3, 6] },
  { name: "homepage", range: [0, 1357], bins: [0, 1, 3, 6] },
  { name: "oucollaborate", range: [0, 38], bins: [0, 1, 2] },
  { name: "dualpane", range: [0, 23], bins: [0, 1, 2, 3] },
  { name: "page", range: [0, 34], bins: [0, 1, 2] }
];
