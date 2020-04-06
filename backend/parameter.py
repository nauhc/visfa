from torch import cuda

HIDDEN_SIZE = 32  # H
NUM_LAYERS = 1  # L
BATCH_SIZE = 32  # B
FEATURE_SIZE = 20  # number of expected features # F
SEQ_SIZE = 180  # max sequence length (# of time steps) # T
OUT_SIZE = 2  # types of class labels
USE_GPU = cuda.is_available()

FEATURES = [
    # 'externalquiz',  # 0
    # 'htmlactivity',  # 1
    'resource',  # 2 => 0
    'oucontent',  # 3 => 1
    'url',  # 4 => 2
    'ouwiki',  # 5 => 3
    # 'ouelluminate',  # 6
    'quiz',  # 7 => 4
    'dataplus',  # 8 => 5
    'glossary',  # 9 => 6
    'folder',  # 10 => 7
    'subpage',  # 11 => 8
    'forumng',  # 12 => 9
    # 'sharedsubpage',  # 13
    'repeatactivity',  # 14 => 10
    'questionnaire',  # 15 => 11
    'homepage',  # 16 => 12
    'oucollaborate',  # 17 => 13
    'dualpane',  # 18 => 14
    'page'  # 19 => 15
]
