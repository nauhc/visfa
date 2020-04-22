# Author: Chuan Wang
from flask import Flask, jsonify, request
from flask_cors import CORS
from numpy import load
from torch import from_numpy
from norce.NoRCE import NoRCE
from rnn.biLSTM_inference import biLSTM_inference
from instance_props import generatePropertyData
import json

app = Flask(__name__)
CORS(app)

# time = '20200404-190935'
# best_epoch = 23
# best_accuracy = 0.89

filepath = './data/oulad/'
T = 180
time = '20200409-061253'
# # best
# epoch = 23
# accuracy = 0.88
# #
# epoch = 13
# accuracy = 0.85
# #
# epoch = 8
# accuracy = 0.84
# #
epoch = 2
accuracy = 0.79
# #
# epoch = 0
# accuracy = 0.61


@app.route("/", methods=["POST", "GET"])
def index():
    return jsonify({'abc': 'ddd', 'bbd': 'ccc'})


@app.route("/visfa", methods=["POST"])
def visfa():
    print('\nREST API CALL, visfa\n')
    d = request.get_json()
    # print('\n', d)

    selectedInstanceId = d['selectedInstanceId']
    selectedClass = d['selectedClass']
    selectedGender = d['selectedGender']
    selectedEdu = d['selectedEdu']

    propertyVisData = generatePropertyData(
        time, epoch, accuracy, selectedInstanceId, selectedClass, selectedGender, selectedEdu)
    print('\nDone generating property data.')
    return jsonify(propertyVisData)

    # sampledPropertyVisData = sampledPropertyData(
    #     time, epoch, accuracy, 0.05, selectedInstanceId, selectedClass, selectedGender, selectedAge)
    # print('\nDone generating sampled property data.')
    #
    # return jsonify(sampledPropertyVisData)


@app.route("/norce", methods=["POST"])
def norce():
    print('\nREST API CALL, norce\n')

    d = request.get_json()
    print('\n', d)

    featureIdx = d['selectedFeatureIdx']
    attnRange = d['selectedAttnRange']
    attnPercentile = [
        float(obj['x']) / 100 for obj in d['selectedAttnPercentile']]

    SAMPLE_SIZE = d['sampleSize']
    TOPK = d['selectedClusterNumber']
    ELBOW = d['selectedNoiseReductionLvl']

    print('\n\nSAMPLE_SIZE', SAMPLE_SIZE)
    print('featureIdx', featureIdx)
    print('attnRange', attnRange)
    print('attnPercentile', attnPercentile)
    print('topK', TOPK)

    norce_obj = NoRCE(filepath, time, epoch,
                      accuracy, T, SAMPLE_SIZE, TOPK, ELBOW)
    results = norce_obj.run(featureIdx, attnRange, attnRatio=attnPercentile)

    # print('\nresults\n', results)
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, port=5050)
