# Author: Chuan Wang
from flask import Flask, jsonify, request
from flask_cors import CORS
from numpy import load
from torch import from_numpy
from norce.NoRCE import NoRCE
from rnn.biLSTM_inference import biLSTM_inference
from instance_props import generatePropertyData, sampledPropertyData
from attention import generateAttentionData
import json

app = Flask(__name__)
CORS(app)


time = '20200115-194901'
best_epoch = 46
best_accuracy = 0.96
filepath = './data/mimic/'
T = 48


@app.route("/", methods=["POST", "GET"])
def index():
    return jsonify({'abc': 'ddd', 'bbd': 'ccc'})


@app.route("/predict", methods=["GET"])
def predict():
    data10 = load(filepath + 'random10_data.npy')
    labels10 = load(filepath + 'random10_labels.npy')
    input = from_numpy(data10[0])

    model = biLSTM_inference(filepath, time, best_epoch, best_accuracy)
    results = model.predict(input)

    arr = []
    for row in results:
        arr.append({'1': row[0], '0': row[1]})

    return jsonify(arr)


@app.route("/visfa", methods=["POST"])
def visfa():
    print('\nREST API CALL, visfa\n')
    featureIdx = 2  # which feature in the feature list (bottom)
    attnRange = [0.05, 1]  # selected attention range

    d = request.get_json()
    # print('\n', d)

    selectedInstanceId = d['selectedInstanceId']
    selectedClass = d['selectedClass']
    selectedAge = d['selectedAge']
    selectedGender = d['selectedGender']

    # propertyVisData = generatePropertyData(time, best_epoch, best_accuracy)
    # print('\nDone generating property data.')
    # return jsonify(propertyVisData)

    sampledPropertyVisData = sampledPropertyData(
        time, best_epoch, best_accuracy, 0.05, selectedInstanceId, selectedClass, selectedGender, selectedAge)
    print('\nDone generating sampled property data.')

    return jsonify(sampledPropertyVisData)

    # attentionData = generateAttentionData(time, best_epoch, best_accuracy)
    # return jsonify({
    #     'property': propertyVisData,
    #     'attention': attentionData
    # })


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
    app.run(debug=True, host='0.0.0.0', port=80)
