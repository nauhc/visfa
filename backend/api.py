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

time = '20200409-061253'
best_epoch = 23
best_accuracy = 0.88
filepath = './data/oulad/'
T = 180


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
    selectedAge = d['selectedAge']
    selectedGender = d['selectedGender']

    propertyVisData = generatePropertyData(time, best_epoch, best_accuracy)
    print('\nDone generating property data.')
    return jsonify(propertyVisData)

    # sampledPropertyVisData = sampledPropertyData(
    #     time, best_epoch, best_accuracy, 0.05, selectedInstanceId, selectedClass, selectedGender, selectedAge)
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
    SAMPLE_SIZE = d['sampleSize']
    TOPK = d['selectedClusterNumber']
    ELBOW = d['selectedNoiseReductionLvl']

    print('SAMPLE_SIZE', SAMPLE_SIZE)
    print('featureIdx', featureIdx)
    print('attnRange', attnRange)
    print('topK', TOPK)

    norce_obj = NoRCE(filepath, time, best_epoch,
                      best_accuracy, T, SAMPLE_SIZE, TOPK, ELBOW)
    results = norce_obj.run(featureIdx, attnRange)

    # # batch
    # print('batch preprocessing')
    # for elbow in [0, 0.1, 0.2, 0.3]:
    #     for topk in [1, 2, 3, 4, 5]:
    #         norce_obj = NoRCE(filepath, time, best_epoch,
    #                           best_accuracy, T, SAMPLE_SIZE, topk, elbow)
    #         results = norce_obj.run(featureIdx, attnRange)

    # print('\nresults\n', results)

    # return jsonify({'abc': 'ddd', 'bbd': 'ccc'})
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
