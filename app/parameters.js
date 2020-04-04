// featues (no variation removed) are calculated seperately in the MIMIC_pytorch project
export const TEMPORAL_LENGTH = 48;
export const FEATURES = [
  {
    name: "ICU Stay Length",
    range: [0, 47],
    bins: [0, 1, 18, 22, 24, 27, 30, 34, 39, 44]
  },
  {
    name: "01-Drips",
    range: [-855, 179781],
    bins: [-855, 0, 0.001, 11, 25, 52, 109, 225, 457, 1249]
  },
  {
    name: "09-Antibiotics (Non IV)",
    range: [-1472, 20626],
    bins: [-1472, 0, 0.083, 51, 99, 124, 259, 500, 999, 1969]
  },
  {
    name: "02-Fluids (Crystalloids)",
    range: [-26000, 11000],
    bins: [-26000, 0, 0.2, 250, 500, 1000]
  },
  {
    name: "15-Supplements",
    range: [-15, 5700],
    bins: [-15, 0, 1, 49, 99, 199, 249, 399, 499]
  },
  {
    name: "16-Pre Admission",
    range: [-6000, 11100],
    bins: [-6000, 0, 0.05, 1, 2, 5, 10, 24, 49, 99]
  },
  {
    name: "05-Med Bolus",
    range: [-204, 954],
    bins: [-204, 0, 0.4, 2, 3, 4, 5, 6, 10]
  },
  {
    name: "06-Insulin (Non IV)",
    range: [-196, 288535],
    bins: [-196, 0, 0.05, 268, 281, 303, 350, 375, 654]
  },
  {
    name: "12-Parenteral Nutrition",
    range: [-2514, 6601],
    bins: [-2514, 0, 1, 51, 101, 201]
  },
  { name: "14-Oral/Gastric Intake", range: [-23, 2000], bins: [-23, 0, 1, 2] },
  {
    name: "04-Fluids (Colloids)",
    range: [-1122, 343],
    bins: [-1122, 0, 3, 11, 51]
  },
  { name: "10-Prophylaxis (IV)", range: [-20, 5000], bins: [-20, 0, 1] },
  {
    name: "08-Antibiotics (IV)",
    range: [0, 4297],
    bins: [0, 0.833, 241, 578, 937, 999, 1118, 1960, 1999, 2439]
  },
  {
    name: "03-IV Fluid Bolus",
    range: [0, 6604],
    bins: [0, 0.166, 41, 69, 97, 128, 174, 242, 430, 719]
  },
  {
    name: "11-Prophylaxis (Non IV)",
    range: [-3840, 240840],
    bins: [-3840, 0, 5, 50, 60, 100, 120, 150, 240, 250]
  },
  {
    name: "07-Blood Products",
    range: [-4290, 45764],
    bins: [-4290, 0, 1, 700, 1030, 2000, 2481, 3000, 4000, 5350]
  },
  {
    name: "Continuous Procedures",
    range: [-4290, 45764],
    bins: [0.0, 1.0, 2.0, 3.0, 4.0]
  },
  {
    name: "Dialysis",
    range: [0, 5351],
    bins: [0, 1, 135, 180, 192, 225, 240, 270, 419, 1320]
  },
  {
    name: "Intubation/Extubation",
    range: [0, 15876],
    bins: [0, 10, 230, 480, 1010, 1350, 2560, 3480, 4350, 5715]
  },
  { name: "Communication", range: [0, 15876], bins: [0.0, 1.0, 2.0, 3.0, 4.0] },
  {
    name: "CRRT Filter Change",
    range: [0, 15876],
    bins: [0.0, 1.0, 2.0, 3.0, 4.0]
  },
  {
    name: "Invasive Lines",
    range: [0, 93394],
    bins: [0, 1, 1177, 2065, 2948, 3943, 5189, 6923, 9158, 13500]
  },
  {
    name: "Ventilation",
    range: [0, 27015],
    bins: [0, 1, 840, 1433, 2011, 2621, 3322, 4320, 5589, 7744]
  },
  {
    name: "Significant Events",
    range: [0, 11640],
    bins: [0, 1, 239, 335, 1593, 2389, 5975, 11640]
  },
  {
    name: "Peripheral Lines",
    range: [0, 11640],
    bins: [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
  },
  {
    name: "Procedures",
    range: [0, 11640],
    bins: [0.0, 1.0, 2.0, 3.0, 4.0, 8.0, 10.0]
  },
  {
    name: "Imaging",
    range: [0, 112281],
    bins: [0, 1, 290, 783, 1332, 2577, 3910, 5781, 8515, 13638]
  },
  {
    name: "Other Body Fluid",
    range: [0, 577868],
    bins: [0, 0.8, 185, 441, 646, 1354, 2296, 3535, 5879, 15002]
  },
  {
    name: "Joint Fluid",
    range: [-334, 514325],
    bins: [-334, 0, 0.01, 85, 235, 423, 688, 913, 1185, 1675]
  },
  {
    name: "Pleural",
    range: [0, 370797],
    bins: [0, 54, 195, 229, 239, 271, 304, 353, 1175, 5441]
  },
  {
    name: "Cerebrospinal Fluid (CSF)",
    range: [0, 1753100],
    bins: [0, 1, 11838, 54672, 64600, 111100, 403100]
  },
  { name: "Urine", range: [0, 1070512], bins: [0, 0.5, 7, 100, 549] },
  {
    name: "Ascites",
    range: [0, 2650122],
    bins: [0, 8, 490, 1296, 2416, 4310, 7438, 25903, 38344, 60196]
  },
  {
    name: "Blood",
    range: [0, 52225],
    bins: [0, 0.3, 8, 32, 63, 132, 295, 543, 778, 1060]
  }
];

// [
//   // // - icu -
//   "ICU Stay Length", // 0
//   // // - input -
//   "01-Drips", // 1
//   "09-Antibiotics (Non IV)", // 2
//   "02-Fluids (Crystalloids)", // 3
//   "15-Supplements", // 4
//   "16-Pre Admission", // 5
//   "05-Med Bolus", // 6
//   "06-Insulin (Non IV)", // 7
//   "12-Parenteral Nutrition", // 8
//   "14-Oral/Gastric Intake", // 9
//   "04-Fluids (Colloids)", // 10
//   "10-Prophylaxis (IV)", // 11
//   "08-Antibiotics (IV)", // 12
//   "03-IV Fluid Bolus", // 13
//   "11-Prophylaxis (Non IV)", // 14
//   "13-Enteral Nutrition", // 15
//   "07-Blood Products", // 16 -> 15
//   // // - procedure -
//   "Peritoneal Dialysis", // 17
//   "Continuous Procedures", // 18 -> 16
//   "Dialysis", // 19 -> 17
//   "Intubation/Extubation", // 20 -> 18
//   "Communication", // 21 -> 19
//   "CRRT Filter Change", // 22 -> 20
//   "Invasive Lines", // 23 -> 21
//   "Ventilation", // 24 -> 22
//   "Significant Events", // 25 -> 23
//   "Peripheral Lines", // 26 -> 24
//   "Procedures", // 27 -> 25
//   "Imaging", // 28 -> 26
//   // // - labs -
//   "Other Body Fluid", // 29 -> 27
//   "Joint Fluid", // 30 -> 28
//   "Pleural", // 31 -> 29
//   "Cerebrospinal Fluid (CSF)", // 32 -> 30
//   "Urine", // 33 -> 31
//   "Ascites", // 34 -> 32
//   "Stool", // 35
//   "Blood" // 36 -> 33
// ];
