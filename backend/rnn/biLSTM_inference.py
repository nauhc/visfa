# load model
import torch
from torch.utils.data import DataLoader
from .biLSTM_multi_to_one import biLSTM_multi_to_one
from parameter import HIDDEN_SIZE, NUM_LAYERS, FEATURE_SIZE, SEQ_SIZE, OUT_SIZE, USE_GPU


class biLSTM_inference:
    def __init__(self, filepath, time, epoch, accuracy):
        self.path = filepath
        self.t = time
        self.epoch = epoch
        self.accuracy = accuracy

    def predict(self, input):
        # if only one instance
        if len(input.shape) == 2:
            input = input.unsqueeze(0)
        # regular cases: multiple instances
        BATCH_SIZE = input.shape[0]

        model = biLSTM_multi_to_one(batch_size=BATCH_SIZE, seq_size=SEQ_SIZE,
                                    feature_size=FEATURE_SIZE,
                                    hidden_size=HIDDEN_SIZE, num_layers=NUM_LAYERS,
                                    out_size=OUT_SIZE, use_gpu=USE_GPU).double()
        filename = 'checkpoint-' + self.t + \
            '-%03dEpoch-%.2f' % (self.epoch, self.accuracy)
        model.load_state_dict(torch.load(self.path + filename))

        outputs = model(input)  # log_softmax results
        # convert back to probabilities
        prediction = torch.exp(outputs).data.numpy()
        # print(prediction)
        # print(labels10)
        return prediction
