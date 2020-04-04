import pandas as pd
import numpy as np
import json
import csv
from sklearn.manifold import TSNE
from os import path
np.set_printoptions(suppress=True)
propFilePath = './data/mimic/props/'
visFilePath = './data/mimic/vis_data/'


def normalize(raw):
    maxx = max(raw)
    minn = min(raw)
    return [(float(i) - minn) / float(maxx - minn) for i in raw]


def calculateTimeDifferenceInYear(df, startTime, endTime, diffTime):

    df[endTime] = pd.to_datetime(df[endTime]).dt.date
    df[startTime] = pd.to_datetime(df[startTime]).dt.date
    df[diffTime] = (df[endTime] - df[startTime]
                    ).apply(lambda d: d.days // 365)
    return df


def property():
    admissions = pd.read_csv(propFilePath + 'mvadmissions.csv')
    admissions = admissions[['subject_id', 'hadm_id', 'admittime']]
    admidSubIdDict = pd.Series(
        admissions.subject_id.values, index=admissions.hadm_id).to_dict()
    admissionDict = pd.Series(
        admissions.admittime.values, index=admissions.subject_id).to_dict()
    # print admissionDict

    patients = pd.read_csv(propFilePath + 'mvpatients.csv')
    patients['admittime'] = patients['subject_id'].map(admissionDict)
    # print(patientDict)
    calculateTimeDifferenceInYear(patients, 'dob', 'admittime', 'age')
    # print(patients.head())

    patientGenderDict = pd.Series(
        patients.gender.values, index=patients.subject_id).to_dict()
    patientAgeDict = pd.Series(
        patients.age.values, index=patients.subject_id).to_dict()

    return [admidSubIdDict, patientGenderDict, patientAgeDict]


def classHistogram(classCol):

    alive = np.count_nonzero(classCol)

    result = [{
        'x': 'Dead',
        'Inst Cnt': int((len(classCol) - alive))
    },
        {
        'x': 'Alive',
        'Inst Cnt': int(alive)
    }]
    return result


def genderHistogram(genderCol):
    counts = genderCol.value_counts()

    result = [{
        'x': 'F',
        'Inst Cnt': int(counts['F'])
    },
        {
        'x': 'M',
        'Inst Cnt': int(counts['M'])
    }]
    return result


def attentionHistogram(attnCol):
    hist = np.histogram(attnCol, bins=np.arange(0, 1.1, step=0.1))
    result = []
    for i in range(len(hist[1]) - 1):
        result.append({
            'x': "%.1f-%.1f" % (hist[1][i], hist[1][i] + 0.1),
            'Inst Cnt': int(hist[0][i])
        })

    # print('attentionHistogram', result)
    return result


def ageHistogram(ageCol):
    hist = np.histogram(ageCol, bins=np.arange(0, 110, step=10))
    result = []
    for i in range(len(hist[1]) - 1):
        result.append({
            'x': str(hist[1][i]),
            'Inst Cnt': int(hist[0][i])
        })
    return result


def printDictKeyValue0(dictName, dict):
    print(dictName, list(dict.keys())[0],  list(dict.values())[0])


def saveIdPropertyData(df, simulateIdDictFN, hadmIdFN, dataFN, propFN):

    with open(simulateIdDictFN, 'r') as f:
        simulateIdDict = json.load(f)
    # printDictKeyValue0('simulatedIdDict', simulateIdDict) # 200001: 163870
    allIds = [id for id in np.unique(df['seqId'].tolist())]  # hadmID

    [hadm2subjIdMap, subjId2GenderDict, subjId2AgeDict] = property()
    # print('hadm2subjIdMap key, value', list(hadm2subjIdMap.keys())[0], sorted(
    #     list(hadm2subjIdMap.values()))[0], sorted(list(hadm2subjIdMap.values()))[-1]) # 152223: 23 - 99999
    # printDictKeyValue0('subjId2GenderDict key value', subjId2GenderDict) # 249: F
    # printDictKeyValue0('subjId2AgeDict key value',  subjId2AgeDict) # 249: 81

    # print(np.min(df['seqId']), np.max(df['seqId']))  # 100009 211435 hadm_id

    # class
    seqClassDf = df[['seqId', 'class']].drop_duplicates()
    idClassDict = dict(zip(seqClassDf['seqId'], seqClassDf['class']))

    data_hadmIds = np.unique(np.load(hadmIdFN))

    # dimension reduction coordinates
    data = np.load(dataFN)  # (25604, 48, 37)
    dataReshape = np.reshape(
        data, (data.shape[0], data.shape[1] * data.shape[2]))
    # print('dataReshape', dataReshape.shape)  # (25604, 1776)

    mat = []
    ids = []
    for id in allIds:
        if id < 200000:  # original id
            hadmId = id
            if hadmId not in data_hadmIds:
                print('id not found in data_hadmIds map:', id)
            # find id's row index in dataReshape
            ids.append(id)
            dataIdx = np.where(data_hadmIds == hadmId)[0][0]
            mat.append(dataReshape[dataIdx])
    tsne_reslt = TSNE(n_components=2, learning_rate=700).fit_transform(
        mat)  # take long time
    # print tsne_reslt
    dim0 = tsne_reslt[:, 0]
    dim1 = tsne_reslt[:, 1]
    normed_tsne = np.column_stack((normalize(dim0), normalize(dim1)))
    id_tsne_map = {}
    for i, t in zip(np.array(ids), normed_tsne):
        id_tsne_map[i] = t
    print('id_tsne_map number of keys', len(id_tsne_map.keys()))
    # ----  feature attributes for dimension reduction end ---------

    objArr = []
    for id in allIds:
        if id < 200000:  # original id
            hadmId = id
        else:  # simulated id (dealing with oversampling)
            hadmId = simulateIdDict[str(id)]

        if hadmId not in hadm2subjIdMap.keys():
            print("current hadmID not in idMap, id:", hadmId)
            continue
        subjectId = hadm2subjIdMap[hadmId]

        if (subjectId not in subjId2AgeDict.keys()) or \
                (subjectId not in subjId2GenderDict.keys()):
            print("current subject not in age or gender dict, id:", subjectId)
            continue

        age = subjId2AgeDict[subjectId]
        # DOB is shifted to 300 y earlier for age > 89 in the database
        if (subjId2AgeDict[subjectId] < 0):
            age = 90
        gender = subjId2GenderDict[subjectId]

        objArr.append({
            'id': id,  # original admit id and simulated id
            'tsne': ' '.join([str(c) for c in id_tsne_map[hadmId].tolist()]),
            'age': int(age),
            'gender': gender,
            'class': idClassDict[hadmId]
        })
    outputdf = pd.DataFrame.from_records(objArr)
    outputdf.to_csv(propFN, index=False,
                    quoting=csv.QUOTE_NONE, encoding='utf-8')


def generatePropertyData(time, epoch, accuracy):
    orgCsvFN = 'checkpoint-' + time + \
        '-%03dEpoch-%.2f_attentions_noa4vis.csv' % (epoch, accuracy)
    df = pd.read_csv(visFilePath + orgCsvFN)
    # 1228800 x ['attn', 'class', 'posId', 'seqId', 'vec']

    propFN = visFilePath + orgCsvFN.replace('.csv', '_props.csv')
    if not path.exists(propFN):
        print('\n --- property file not found, generating new ---\n')
        simulateIdDictFN = visFilePath + \
            orgCsvFN.replace('.csv', '_idDict.json')
        hadmIdFN = './data/mimic/training_data/MIMIC_MV_data_hadmIds.npy'
        dataFN = './data/mimic/training_data/MIMIC_MV_data.npy'
        saveIdPropertyData(df, simulateIdDictFN, hadmIdFN, dataFN, propFN)

    # read property file
    propertyDf = pd.read_csv(propFN)

    tsneDF = propertyDf[['tsne', 'id', 'class']]
    tsneDF[['x', 'y']] = tsneDF.tsne.str.split(
        ' ', expand=True).apply(pd.to_numeric)
    tsneDF = tsneDF.drop(['tsne'], axis=1)

    propVisData = {
        'age': ageHistogram(propertyDf['age']),
        'attention': attentionHistogram(df['attn']),
        'class': classHistogram(propertyDf['class']),
        'gender': genderHistogram(propertyDf['gender']),
        'tsne': tsneDF.to_dict('record')
    }

    return propVisData


def commonList(a, b):
    return list(set(a) & set(b))


def updatePropertyVisData(df, visDataDict, instanceId, classId, gender, age):
    selectedInstance = len(instanceId)
    selectedClass = len(classId)
    selectedGender = len(gender)
    selectedAge = len(age)

    selectedIdx = [*range(len(df))]  # intialize to all
    if selectedInstance:
        idxByInstanceId = df[df['id'].isin(instanceId)]['resetIdx'].tolist()
        selectedIdx = commonList(selectedIdx, idxByInstanceId)

    if selectedGender:
        idxSelectedByGender = df[df['gender']
                                 == gender[0]]['resetIdx'].tolist()
        selectedIdx = commonList(selectedIdx, idxSelectedByGender)

    if selectedClass:
        idxSelectedByClass = df[df['class'] == (
            0 if classId[0] == 'Alive' else 1)]['resetIdx'].tolist()
        selectedIdx = commonList(selectedIdx, idxSelectedByClass)

    if selectedAge:
        # idxSelectedByAge = df[df['age'] == age[0]]['resetIdx'].tolist()
        idxSelectedByAge = []
        for ageRange in age:
            idxSelectedByAge += df[(df['age'] >= ageRange) &
                                   (df['age'] < (ageRange + 10))]['resetIdx'].tolist()

        selectedIdx = commonList(selectedIdx, idxSelectedByAge)

    updatedDf = df.loc[df['resetIdx'].isin(selectedIdx)]

    if not selectedClass:  # update class barchart if no class selection
        visDataDict['class'] = classHistogram(updatedDf['class'])
    if not selectedGender:  # update gender barchart if no gender selection
        visDataDict['gender'] = genderHistogram(updatedDf['gender'])
    if not selectedAge:  # update age barchart if no age selection
        visDataDict['age'] = ageHistogram(updatedDf['age'])

    updatedSelection = np.array([False] * len(df))
    updatedSelection[selectedIdx] = True
    # update tsne view
    visDataDict['tsneSelection'] = updatedSelection.tolist()


def sampledPropertyData(time, epoch, accuracy, percentage, instanceId, classId, gender, age):

    orgCsvFN = 'checkpoint-' + time + \
        '-%03dEpoch-%.2f_attentions_noa4vis.csv' % (epoch, accuracy)
    sampleOrgCsvFN = orgCsvFN.replace('.csv', str(percentage) + '.csv')
    sampledDf = pd.read_csv(visFilePath + sampleOrgCsvFN)

    ids = np.unique(sampledDf['seqId'])

    propFN = visFilePath + orgCsvFN.replace('.csv', '_props.csv')
    propertyDf = pd.read_csv(propFN)
    sampledPropertyDf = propertyDf[propertyDf['id'].isin(ids)]
    # original index is patient id, add column resetIdx
    sampledPropertyDf['resetIdx'] = [*range(len(sampledPropertyDf))]
    # print('sampledPropertyDf\n', sampledPropertyDf.head())

    tsneDF = sampledPropertyDf[['tsne', 'id', 'class']]
    tsneDF[['x', 'y']] = tsneDF.tsne.str.split(
        ' ', expand=True).apply(pd.to_numeric)
    tsneDF = tsneDF.drop(['tsne'], axis=1)

    sampledPropVisData = {
        'attention': attentionHistogram(sampledDf['attn']),
        'class': classHistogram(sampledPropertyDf['class']),
        'gender': genderHistogram(sampledPropertyDf['gender']),
        'age': ageHistogram(sampledPropertyDf['age']),
        'tsne': tsneDF.to_dict('record'),
        'tsneSelection': [True] * len(sampledPropertyDf)
    }
    # print(len(instanceId), len(classId), len(gender), len(age))

    if(len(instanceId) or len(classId) or len(gender) or len(age)):
        updatePropertyVisData(sampledPropertyDf, sampledPropVisData,
                              instanceId, classId, gender, age)

    return sampledPropVisData
