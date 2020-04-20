// featues (no variation removed) are calculated seperately in the oulad_pytorch project
export const TEMPORAL_LENGTH = 180;
// export const FEATURES = [
//   {originalName: "resource", range: [0, 1841], bins: [0, 1, 2, 3] },
//   {originalName: "oucontent", range: [0, 608], bins: [0, 1, 4, 10, 22] },
//   {originalName: "url", range: [0, 38], bins: [0, 1, 2] },
//   {originalName: "ouwiki", range: [0, 181], bins: [0, 1, 2, 5] },
//   {originalName: "quiz", range: [0, 1879], bins: [0, 1, 7, 25, 66] },
//   {originalName: "dataplus", range: [0, 56], bins: [0, 1, 3, 5, 8] },
//   {originalName: "glossary", range: [0, 73], bins: [0, 1, 3, 7] },
//   {originalName: "folder", range: [0, 7], bins: [0, 1] },
//   {originalName: "subpage", range: [0, 287], bins: [0, 1, 2, 3, 6] },
//   {originalName: "forumng", range: [0, 268], bins: [0, 1, 3, 5, 11] },
//   {originalName: "repeatactivity", range: [0, 4], bins: [0.0, 3.0, 4.0] },
//   {originalName: "questionnaire", range: [0, 25], bins: [0, 1, 3, 6] },
//   {originalName: "homepage", range: [0, 1357], bins: [0, 1, 3, 6] },
//   {originalName: "oucollaborate", range: [0, 38], bins: [0, 1, 2] },
//   {originalName: "dualpane", range: [0, 23], bins: [0, 1, 2, 3] },
//   {originalName: "page", range: [0, 34], bins: [0, 1, 2] }
// ];

export const FEATURES = [
  // {
  //   range: [],
  //  originalName: "externalquiz",
  //   bins: []
  // },
  // {
  //   range: [],
  //  originalName: "htmlactivity",
  //   bins: []
  // },
  {
    range: [0, 1841],
    originalName: "resource",
    name: "Textbooks",
    bins: [0, 1, 2, 3, 5, 1841]
  },
  {
    range: [0, 608],
    originalName: "oucontent",
    name: "Assessment Questions",
    bins: [0, 1, 2, 3, 6, 9, 12, 17, 24, 37, 608]
  },
  {
    range: [0, 38],
    originalName: "url",
    name: "External Resource",
    bins: [0, 1, 2, 4, 38]
  },
  {
    range: [0, 181],
    originalName: "ouwiki",
    name: "Wiki",
    bins: [0, 1, 2, 3, 4, 6, 11, 181]
  },
  // {
  //   range: [],
  //  originalName: "ouelluminate",
  //   bins: []
  // },
  {
    range: [0, 1382],
    originalName: "quiz",
    name: "Quiz",
    bins: [0, 1, 6, 12, 20, 31, 48, 72, 109, 1382]
  },
  {
    range: [0, 64],
    originalName: "dataplus",
    name: "Additional Data",
    bins: [0, 1, 3, 4, 5, 6, 7, 10, 16, 64]
  },
  {
    range: [0, 73],
    originalName: "glossary",
    name: "Glossary",
    bins: [0, 1, 2, 3, 4, 5, 7, 11, 73]
  },
  {
    range: [0, 7],
    originalName: "folder",
    name: "File Compilation",
    bins: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
  },
  {
    range: [0, 287],
    originalName: "subpage",
    name: "Related Materials",
    bins: [0, 1, 2, 3, 4, 5, 7, 10, 287]
  },
  {
    range: [0, 268],
    originalName: "forumng",
    name: "Forum",
    bins: [0, 1, 2, 3, 5, 6, 9, 12, 20, 268]
  },
  // {
  //   range: [],
  //  originalName: "sharedsubpage",
  //   bins: []
  // },
  {
    range: [0, 3, 4],
    originalName: "repeatactivity",
    name: "LinksToEarly Contents",
    bins: [0.0, 3.0, 4.0]
  },
  {
    range: [0, 20],
    originalName: "questionnaire",
    name: "Non-scored Quiz",
    bins: [0, 1, 3, 4, 5, 6, 7, 20]
  },
  {
    range: [0, 1357],
    originalName: "homepage",
    name: "Homepage",
    bins: [0, 1, 2, 3, 5, 6, 10, 1357]
  },
  {
    range: [0, 38],
    originalName: "oucollaborate",
    name: "Collaboration Assignments",
    bins: [0, 1, 2, 4, 38]
  },
  {
    range: [0, 23],
    originalName: "dualpane",
    name: "Side-by-side View",
    bins: [0, 1, 2, 3, 5, 23]
  },
  {
    range: [0, 34],
    originalName: "page",
    name: "Related Material (Entry)",
    bins: [0, 1, 2, 3, 34]
  }
];
