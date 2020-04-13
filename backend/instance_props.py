import pandas as pd
import numpy as np
import json
import csv
from sklearn.manifold import TSNE
from os import path
np.set_printoptions(suppress=True)
propFilePath = './data/oulad/props/'
visFilePath = './data/oulad/vis_data/'


def normalize(raw):
    maxx = max(raw)
    minn = min(raw)
    return [(float(i) - minn) / float(maxx - minn) for i in raw]


def classHistogram(classCol):

    pas = np.count_nonzero(classCol)

    result = [{
        'x': 'Fail',
        'Inst Cnt': int((len(classCol) - pas))
    },
        {
        'x': 'Pass',
        'Inst Cnt': int(pas)
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
            'Event Cnt': int(hist[0][i])
        })

    # print('attentionHistogram', result)
    return result


def ageHistogram(ageCol):
    hist = np.histogram(ageCol, bins=np.unique(ageCol).tolist())
    result = []
    for i in range(len(hist[1]) - 1):
        result.append({
            'x': str(hist[1][i]),
            'Inst Cnt': int(hist[0][i])
        })
    return result


def educationHistogram(eduCol):
    hist = np.histogram(eduCol, bins=np.unique(eduCol).tolist())
    result = []
    for i in range(len(hist[1]) - 1):
        result.append({
            'x': str(hist[1][i]),
            'Inst Cnt': int(hist[0][i])
        })
    return result


def printDictKeyValue0(dictName, dict):
    print(dictName, list(dict.keys())[0],  list(dict.values())[0])


def saveStudentPropData(df, dataFN, idFN, propFN):
    propDataOrgFile = './data/oulad/props/studentInfo.csv'
    info = pd.read_csv(propDataOrgFile)

    allIds = np.unique(df['seqId'])

    # ----  feature attributes for dimension reduction ---------
    seqClassDf = df[['seqId', 'class']].drop_duplicates()
    idClassDict = dict(zip(seqClassDf['seqId'], seqClassDf['class']))

    # tsne
    data = np.load(dataFN)  # (2098, 180, 20)
    dataReshape = np.reshape(
        data, (data.shape[0], data.shape[1] * data.shape[2]))
    # print('dataReshape', dataReshape.shape)  # (2098, 3600)

    data_studIds = np.load(idFN)
    # print data_studIds[0:10]
    mat = []
    return
    for id in allIds.tolist():
        print(id)
        dataIdx = np.where(data_studIds == id)[0][0]
        mat.append(dataReshape[dataIdx])
    # print('tsne mat shape', np.asarray(mat).shape)  # (2080, 3600)
    tsne_reslt = TSNE(n_components=2, learning_rate=700).fit_transform(mat)
    # print tsne_reslt
    dim0 = tsne_reslt[:, 0]
    dim1 = tsne_reslt[:, 1]
    normed_tsne = np.column_stack((normalize(dim0), normalize(dim1)))

    # map id to tsne results
    id_tsne_map = {}
    for i, t in zip(np.array(allIds), normed_tsne):
        id_tsne_map[i] = t
    # print('id_tsne_map number of keys', len(id_tsne_map.keys()))
    # ----  feature attributes for dimension reduction end ---------

    # basic props
    objArr = []
    for id in allIds.tolist():
        infoRec = info.loc[info['id_student'] == id]
        if not len(infoRec):
            print('info record for id', id, 'NOT found.')
        # if len(infoRec) > 1:
            # print len(infoRec), 'info record for id', id, 'found.'

        row = infoRec.iloc[0]
        tmp = df.loc[df['seqId'] == id].iloc[0]
        objArr.append({
            'id': int(id),  # student id
            'tsne': ' '.join([str(c) for c in id_tsne_map[id].tolist()]),
            'age': row['age_band'],
            'gender': row['gender'],
            'highest_education': row['highest_education'],
            'disability': row['disability'],
            'class': tmp['class']
        })

    outputdf = pd.DataFrame.from_records(objArr)
    outputdf.to_csv(propFN, index=False,
                    quoting=csv.QUOTE_NONE, encoding='utf-8')


def commonList(a, b):
    return list(set(a) & set(b))


def updatePropertyVisData(df, visDataDict, instanceId, classId, gender, education):
    selectedInstance = len(instanceId)
    selectedClass = len(classId)
    selectedGender = len(gender)
    selectedEducation = len(education)

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
            0 if classId[0] == 'Fail' else 1)]['resetIdx'].tolist()
        selectedIdx = commonList(selectedIdx, idxSelectedByClass)

    if selectedEducation:
        idxSelectedByEdu = []
        for edu in education:
            idxSelectedByEdu += df[(df['highest_education']
                                    == edu)]['resetIdx'].tolist()
        selectedIdx = commonList(selectedIdx, idxSelectedByEdu)

    updatedDf = df.loc[df['resetIdx'].isin(selectedIdx)]

    if not selectedClass:  # update class barchart if no class selection
        visDataDict['class'] = classHistogram(updatedDf['class'])
    if not selectedGender:  # update gender barchart if no gender selection
        visDataDict['gender'] = genderHistogram(updatedDf['gender'])
    if not selectedEducation:  # update age barchart if no age selection
        visDataDict['education'] = educationHistogram(
            updatedDf['highest_education'])

    updatedSelection = np.array([False] * len(df))
    updatedSelection[selectedIdx] = True
    # update tsne view
    visDataDict['tsneSelection'] = updatedSelection.tolist()


def generatePropertyData(time, epoch, accuracy, instanceId, classId, gender, education):
    orgCsvFN = 'checkpoint-' + time + \
        '-%03dEpoch-%.2f_attentions_noa4vis.csv' % (epoch, accuracy)
    df = pd.read_csv(visFilePath + orgCsvFN)
    # 374400 x ['attn', 'class', 'posId', 'seqId', 'vec']

    propFN = visFilePath + orgCsvFN.replace('.csv', '_props.csv')
    if not path.exists(propFN):
        print('\n --- property file not found, generating new ---\n')
        dataFN = './data/oulad/training_data/FFF_2013J_data.npy'
        idFN = './data/oulad/training_data/FFF_2013J_ids.npy'
        saveStudentPropData(df, dataFN, idFN, propFN)

    # read property file
    propertyDf = pd.read_csv(propFN)
    propertyDf['resetIdx'] = [*range(len(propertyDf))]

    tsneDF = propertyDf[['tsne', 'id', 'class']]
    tsneDF[['x', 'y']] = tsneDF.tsne.str.split(
        ' ', expand=True).apply(pd.to_numeric)
    tsneDF = tsneDF.drop(['tsne'], axis=1)

    propVisData = {
        'attention': attentionHistogram(df['attn']),
        'age': ageHistogram(propertyDf['age']),
        'class': classHistogram(propertyDf['class']),
        'gender': genderHistogram(propertyDf['gender']),
        'education': educationHistogram(propertyDf['highest_education']),
        'tsne': tsneDF.to_dict('record'),
        'tsneSelection': [True] * len(propertyDf)
    }

    if(len(instanceId) or len(classId) or len(gender) or len(education)):
        updatePropertyVisData(propertyDf, propVisData,
                              instanceId, classId, gender, education)

    return propVisData


# time = '20200404-190935'
# epoch = 23
# accuracy = 0.89

time = '20200409-061253'
epoch = 23
accuracy = 0.88
# generatePropertyData(time, epoch, accuracy)
