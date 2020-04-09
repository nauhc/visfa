// featues (no variation removed) are calculated seperately in the oulad_pytorch project
export const TEMPORAL_LENGTH = 180;
// export const FEATURES = [
//   { name: "resource", range: [0, 1841], bins: [0, 1, 2, 3] },
//   { name: "oucontent", range: [0, 608], bins: [0, 1, 4, 10, 22] },
//   { name: "url", range: [0, 38], bins: [0, 1, 2] },
//   { name: "ouwiki", range: [0, 181], bins: [0, 1, 2, 5] },
//   { name: "quiz", range: [0, 1879], bins: [0, 1, 7, 25, 66] },
//   { name: "dataplus", range: [0, 56], bins: [0, 1, 3, 5, 8] },
//   { name: "glossary", range: [0, 73], bins: [0, 1, 3, 7] },
//   { name: "folder", range: [0, 7], bins: [0, 1] },
//   { name: "subpage", range: [0, 287], bins: [0, 1, 2, 3, 6] },
//   { name: "forumng", range: [0, 268], bins: [0, 1, 3, 5, 11] },
//   { name: "repeatactivity", range: [0, 4], bins: [0.0, 3.0, 4.0] },
//   { name: "questionnaire", range: [0, 25], bins: [0, 1, 3, 6] },
//   { name: "homepage", range: [0, 1357], bins: [0, 1, 3, 6] },
//   { name: "oucollaborate", range: [0, 38], bins: [0, 1, 2] },
//   { name: "dualpane", range: [0, 23], bins: [0, 1, 2, 3] },
//   { name: "page", range: [0, 34], bins: [0, 1, 2] }
// ];

export const FEATURES = [
  // {
  //   range: [],
  //   name: "externalquiz",
  //   bins: []
  // },
  // {
  //   range: [],
  //   name: "htmlactivity",
  //   bins: []
  // },
  {
    range: [1, 1841],
    name: "resource",
    bins: [1, 2, 3, 5, 1841]
  },
  {
    range: [1, 608],
    name: "oucontent",
    bins: [1, 2, 3, 6, 9, 12, 17, 24, 37, 608]
  },
  {
    range: [1, 38],
    name: "url",
    bins: [1, 2, 4, 38]
  },
  {
    range: [1, 181],
    name: "ouwiki",
    bins: [1, 2, 3, 4, 6, 11, 181]
  },
  // {
  //   range: [],
  //   name: "ouelluminate",
  //   bins: []
  // },
  {
    range: [1, 1382],
    name: "quiz",
    bins: [1, 6, 12, 20, 31, 48, 72, 109, 1382]
  },
  {
    range: [1, 64],
    name: "dataplus",
    bins: [1, 3, 4, 5, 6, 7, 10, 16, 64]
  },
  {
    range: [1, 73],
    name: "glossary",
    bins: [1, 2, 3, 4, 5, 7, 11, 73]
  },
  {
    range: [1, 7],
    name: "folder",
    bins: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
  },
  {
    range: [1, 287],
    name: "subpage",
    bins: [1, 2, 3, 4, 5, 7, 10, 287]
  },
  {
    range: [1, 268],
    name: "forumng",
    bins: [1, 2, 3, 5, 6, 9, 12, 20, 268]
  },
  // {
  //   range: [],
  //   name: "sharedsubpage",
  //   bins: []
  // },
  // {
  //   range: [3, 4],
  //   name: "repeatactivity",
  //   bins: [3.0, 4.0]
  // },
  {
    range: [1, 20],
    name: "questionnaire",
    bins: [1, 3, 4, 5, 6, 7, 20]
  },
  {
    range: [1, 1357],
    name: "homepage",
    bins: [1, 2, 3, 5, 6, 10, 1357]
  },
  {
    range: [1, 38],
    name: "oucollaborate",
    bins: [1, 2, 4, 38]
  },
  {
    range: [1, 23],
    name: "dualpane",
    bins: [1, 2, 3, 5, 23]
  },
  {
    range: [1, 34],
    name: "page",
    bins: [1, 2, 3, 34]
  }
];
