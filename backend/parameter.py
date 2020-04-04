from torch import cuda

HIDDEN_SIZE = 128 # H
NUM_LAYERS = 1 # L
BATCH_SIZE = 64 # B
FEATURE_SIZE = 37 # number of expected features # F
SEQ_SIZE = 48 # max sequence length (# of time steps) # T
OUT_SIZE = 2 # types of class labels
USE_GPU = cuda.is_available()

FEATURES = [
    # - icu -
    "ICU Stay Length", # 0
    # - input -
    "01-Drips", # 1
    "09-Antibiotics (Non IV)", # 2
    "02-Fluids (Crystalloids)", # 3
    "15-Supplements", # 4
    "16-Pre Admission", # 5
    "05-Med Bolus", # 6
    "06-Insulin (Non IV)", # 7
    "12-Parenteral Nutrition", # 8
    "14-Oral/Gastric Intake", # 9
    "04-Fluids (Colloids)", # 10
    "10-Prophylaxis (IV)", # 11
    "08-Antibiotics (IV)", # 12
    "03-IV Fluid Bolus", # 13
    "11-Prophylaxis (Non IV)", # 14
    # "13-Enteral Nutrition", # 15
    "07-Blood Products", # 16 -> 15
    # - procedure -
    # "Peritoneal Dialysis", # 17
    "Continuous Procedures", # 18 -> 16
    "Dialysis", # 19 -> 17
    "Intubation/Extubation", # 20 -> 18
    "Communication", # 21 -> 19
    "CRRT Filter Change", # 22 -> 20
    "Invasive Lines", # 23 -> 21
    "Ventilation", # 24 -> 22
    "Significant Events", # 25 -> 23
    "Peripheral Lines", # 26 -> 24
    "Procedures", # 27 -> 25
    "Imaging", # 28 -> 26
    # - labs -
    "Other Body Fluid", # 29 -> 27
    "Joint Fluid", # 30 -> 28
    "Pleural", # 31 -> 29
    "Cerebrospinal Fluid (CSF)", # 32 -> 30
    "Urine", # 33 -> 31
    "Ascites", # 34 -> 32
    # "Stool", # 35
    "Blood" # 36 -> 33
]
