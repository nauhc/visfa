import torch
from torch.utils.data import TensorDataset, DataLoader, random_split
from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
from numpy import sqrt
# from parameter import HIDDEN_SIZE, NUM_LAYERS, BATCH_SIZE, FEATURE_SIZE, SEQ_SIZE, OUT_SIZE, USE_GPU

class Attn(nn.Module):
    def __init__(self, hidden_size, batch_first=True):
      super(Attn, self).__init__()
      self.hidden_size = hidden_size
      self.batch_first = batch_first

      # self.weights = nn.Parameter(torch.Tensor(1, hidden_size)) # [1, H]
      self.weights = nn.Parameter(torch.Tensor(hidden_size, 1)) # [H, 1]
      stdv = 1.0 / sqrt(self.hidden_size)
      for weight in self.weights:
          nn.init.uniform_(weight, -stdv, stdv)

    def forward(self, x):
      # x.size(): [64, 48, 256] [B, T, H*2]
      if self.batch_first:
        batch_size, seq_size = x.size()[:2]
      else:
        seq_size, batch_size = x.size()[:2]
      # batch_size:64, seq_size: 48

      # self.weights: (H*2, 1)
      # self.weights.unsqueeze(0): (1,H*2,1)
      # self.weights.unsqueeze(0).repeat(batch_size, 1, 1): (B, H*2, 1)
      weights = torch.bmm(x, self.weights.unsqueeze(0).repeat(batch_size, 1, 1))
      # print('weights', weights.shape) [B, T, 1]

      attentions = torch.softmax(F.relu(weights.squeeze()), dim=-1) # [B, T]

      # apply attention weights
      weighted_input = torch.mul(x, attentions.unsqueeze(-1).expand_as(x)) # [B, T, H*2]


      return weighted_input, attentions


class biLSTM_multi_to_one(nn.Module):
  def __init__(self, batch_size, seq_size, feature_size, hidden_size, num_layers, out_size, use_gpu):
    super(biLSTM_multi_to_one, self).__init__()
    self.use_gpu = use_gpu
    self.batch_size = batch_size
    self.seq_size = seq_size
    self.hidden_size = hidden_size
    self.num_layers = num_layers
    # self.out_size = out_size
    self.lstm = nn.LSTM(input_size = feature_size,
                        hidden_size = hidden_size,
                        num_layers = num_layers,
                        batch_first = True,
                        bidirectional = True)
    self.hidden2label = nn.Linear(hidden_size*2, out_size)
    self.hidden = self.initial_hidden()

    # attention layer
    # self.attn = nn.Linear(self.hidden_size * 2, self.seq_size)
    # self.attn_combine = nn.Linear(self.hidden_size * 2, self.hidden_size)
    self.attention = Attn(self.hidden_size * 2)

  def initial_hidden(self):
    # first is the hidden h
    # second is the cell c
      return (Variable(torch.zeros(2, self.batch_size, self.hidden_size)).double(),
                Variable(torch.zeros(2, self.batch_size, self.hidden_size)).double())

  def forward(self, x):
      # # x = self.embedings(data).view(len(sentence), self.batch_size, -1)
      # # convert numpy array to torch tensor
      # data_torch_tensor = torch.from_numpy(data)
      # # transpose to fit LSTM tensor shape
      # x = torch.transpose(data_torch_tensor, 0, 1)
      self.hidden = self.initial_hidden()

      lstm_out, self.hidden = self.lstm(x, self.hidden)
      # print('lstm_out: ', lstm_out.shape) # [B, T, H*2]
      # print('self.hidden: ', self.hidden[0].shape, self.hidden[1].shape) # [2,B,H], [2,B,H]

      # # attention layer after LSTM
      attn_out, attns = self.attention(lstm_out)
      # print('attn_out', attn_out.shape) # [B, T, H*2]
      # print('attn_out[:, -1, :]', attn_out[:, -1, :].shape) # [B, H*2]
      # print('attns.shape', attns.shape) # [B, T]

      y = self.hidden2label(attn_out[:, -1, :].double())
      # y = self.hidden2label(lstm_out[:, -1, :].double())
      # print('y.shape: ', y.shape) # [48, 2]
      log_probs = nn.functional.log_softmax(y)
      # print('log_probs.shape: ', log_probs.shape) # [48,2]
      return log_probs
