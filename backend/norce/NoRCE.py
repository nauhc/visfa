import numpy as np
import pandas as pd
from scipy.cluster import hierarchy
from scipy.spatial import distance
from collections import Counter
from os import path
from .gapstatistic import gapStatistic
# from .utils import utils
from json import dumps, loads, dump, load
from math import log10


class NoRCE:
    def __init__(self, filepath, time, epoch, accuracy, T, sample_size, topk, elbow):
        self.path = filepath
        self.t = time
        self.epoch = epoch
        self.accuracy = accuracy
        self.T = T
        self.sample_size = sample_size
        self.topk = topk
        self.elbow = elbow  # int((1 - elbow) * sample_size

    def reshape(self, arr):
        eventCnt = len(arr)
        vecs = arr[:, 4:]
        print('\narray shape BEFORE reshaping', vecs.shape)  # (618912, 34)

        # return reshaped dimensions : (id, time, feature)
        reshaped = np.reshape(
            vecs, (eventCnt // self.T, self.T, vecs.shape[1]))
        print('array shape AFTER reshaping', reshaped.shape)
        return reshaped

    # stratified Sampling by hierarchical clustering
    # and sample one instance from each cluster
    def sampling(self, mat, K):
        Z = hierarchy.linkage(mat, 'average')
        tree = hierarchy.cut_tree(Z, n_clusters=K)

        # #get the first sample from each cluster
        sampleIdx = [np.where(tree == k)[0][0] for k in range(K)]
        return sampleIdx

    # dividing leaf nodes to two parts:
    # poolUp stores all leaf node indices left to elbow
    # poolBot stores all leaf node indices right to elbow
    def divideLeafNodes(self, Z, elbow_size):
        # node ids in Z should be unique
        subUpMat = Z[:elbow_size, 0:2].flatten()
        subBotMat = Z[elbow_size:, 0:2].flatten()

        N = len(Z) + 1
        poolUp = []
        poolBot = []
        for nodeId in subUpMat:
            if nodeId < N - 1:
                poolUp.append(int(nodeId))

        for nodeId in subBotMat:
            if nodeId < N - 1:
                poolBot.append(int(nodeId))

        return poolUp, poolBot

    # elbow() function returns the instance indices left to the elbow (majorIdx),
    # right to the elbow (minorIdx aka noise),
    # and cluster memberships for majorIdx
    def noiseReductElbow(self, Z):
        root, nodelist = hierarchy.to_tree(Z, rd=True)
        elbow_size = int((1 - self.elbow) *
                         (self.sample_size if self.sample_size else len(Z) + 1))

        cutDist = Z[elbow_size][2]
        cuttree = hierarchy.cut_tree(
            Z, height=cutDist)  # high computation cost

        majorIdx, minorIdx = self.divideLeafNodes(Z, elbow_size)

        # memberships = np.array(cuttree)[majorIdx]

        # return majorIdx, minorIdx, memberships
        return majorIdx

    def clusterRemoveNan(self, mat):
        # cluster = np.empty(mat.shape[1])
        # cluster.fill(np.nan)
        cluster = []
        for col in range(mat.shape[1]):
            tmp = mat[:, col]
            tmp = tmp[~np.isnan(tmp)]
            if (len(tmp)):
                # cluster[col] = tmp
                cluster.append(tmp)
            else:
                cluster.append(np.nan)
        return cluster

    def percentileVisData(self, cluster, percents, withNan):
        # percentile arr
        if withNan:
            tCnt = len(cluster)
        else:
            tCnt = cluster.shape[1]
        percentileArr = []
        for col in range(tCnt):
            values = cluster[col]
            percentileArr.append(
                [np.percentile(values, p, interpolation='nearest') for p in percents])
        percentileArr = np.around(np.array(percentileArr), 4)
        percentileArr = np.nan_to_num(percentileArr)
        # print('percentileArr', percentileArr.shape)  # (180, 5)

        firstCol = percentileArr[:, 0].reshape(tCnt, 1)
        stackedPercentile = np.concatenate(
            (firstCol, np.diff(percentileArr, axis=1)), axis=1)
        # print('stackedPercentile', stackedPercentile.shape)  # (180, 5)

        percentileDF = pd.DataFrame(stackedPercentile, index=[
            'T' + str(i) for i in range(stackedPercentile.shape[0])],
            columns=[str(p) for p in percents])
        # print('percentileDF.head()', percentileDF.head())
        percentileDF['time'] = percentileDF.index
        percentileJson = loads(percentileDF.to_json(orient='records'))

        percentileSum = np.sum(percentileArr, axis=1)
        # print('percentileSum', percentileSum)
        min = np.nanmin(stackedPercentile)
        max = np.nanmax(stackedPercentile)

        avrg = np.around(np.mean(percentileArr, axis=1), 4).tolist()
        avrgDict = {'name': 'mean'}
        for (i, v) in enumerate(avrg):
            avrgDict['T' + str(i)] = v
        avrgJson = loads(dumps(avrgDict))

        # # percentile arr reformat for vis
        # percentileDict = {'t': range(tCnt)}
        # firstCol = percentileArr[:, 0].reshape(tCnt, 1)
        #
        # # print('np.diff(percentileArr, axis=1)')
        # # print(np.diff(percentileArr, axis=1))
        # stackedPercentile = np.concatenate((firstCol,
        #                                     np.diff(percentileArr, axis=1)), axis=1)
        # stackedPercentile = np.nan_to_num(stackedPercentile)
        # print('stackedPercentile')
        # print(stackedPercentile)

        # for p in range(len(percents)):
        #     percentileDict[str(percents[p])] = stackedPercentile[:, p]
        # # print('percentileDict')
        # # print(percentileDict)

        return percentileJson, avrgJson, min, max

    def subClusters(self, mat0fill, mat, withNan, majorIdx, memberships, K):
        # topClusters = Counter(memberships.flatten()).most_common(TOPK)
        clusters = Counter(memberships).most_common(K)
        # print('clusters', clusters)

        # percents = [0, 20, 40, 60, 80, 100]
        # percents = [10, 20, 40, 60, 80, 90]
        percents = [10, 30, 50, 70, 90]
        # percents = [10, 25, 40, 60, 75, 90]
        # percents = [15, 25, 40, 60, 75, 85]

        topClusterVis = []
        # for c, labelNCnt in enumerate(topClusters):
        for c, labelNCnt in enumerate(clusters):
            # print('\nTop %d cluster:' % c)
            clusterId = labelNCnt[0]
            clusterSize = labelNCnt[1]

            idx = np.array(majorIdx)[np.where(
                np.array(memberships) == clusterId)[0]]

            cluster0fill = mat0fill[idx]  # numpy array
            clusterWithNan = mat[idx]  # numpy array
            # print('clusterWithNan\n', clusterWithNan.shape)

            # number of non nan per ts - barchart on top
            tsCntNonNan = np.count_nonzero(~np.isnan(clusterWithNan), axis=0)
            tsHist = []
            tsCntMax = 0
            for (i, v) in enumerate(tsCntNonNan):
                curV = int(v)
                if curV > tsCntMax:
                    tsCntMax = curV
                tsHist.append({
                    'time': "T" + str(i),
                    'cnt': curV
                })

            # calculate percentile
            # cluster: regular array with possible np.nan and
            # very lengths sub np arrays
            cluster = self.clusterRemoveNan(clusterWithNan)
            percentileJson, clusterCenter, minValue, maxValue = self.percentileVisData(
                cluster, percents, withNan)
            topClusterVis.append({
                'percents': percents,
                'percentiles': percentileJson,
                # 'percentileDict': percentileDict,
                # 'scatter': scatter,
                'tsHist': tsHist,
                'tsMax': tsCntMax,
                'min': minValue,
                'max': maxValue,
                'center': clusterCenter,
                'size': [{"name": "size", "value": clusterSize}],
                'allCnt': len(memberships)
            })

        return topClusterVis

    def attnPortionsSaveFile(self, arr, fn):
        attns = arr[:, 0]
        dict = {}
        for portion in np.arange(0, 1, 0.1):
            idx = np.where((attns >= portion) & (attns < (portion + 0.1)))[0]
            # set the attn on idx as original and set the rest as nan
            dict['%.1f' % portion] = idx.tolist()
        with open(fn, 'w') as fp:
            dump(dict, fp)

    def attnPercentileSaveFile(self, arr, fn):
        attns = arr[:, 0]
        dict = {}
        thresholds = []
        for percentile in np.arange(0, 101, 10):
            v = np.percentile(attns, percentile, interpolation='nearest')
            thresholds.append(v)
            # print('percentile', percentile, 'threshold', v)
        for (i, thr) in enumerate(thresholds[:-1]):
            # print(i, thr)
            idx = np.where((attns >= thr) & (attns < thresholds[i + 1]))[0]
            # set the attn on idx as original and set the rest as nan
            dict['%.1f' % (i * 0.1)] = idx.tolist()
        # print('percentile dict', dict.keys())
        with open(fn, 'w') as fp:
            dump(dict, fp)

    def posNegIdxConv2ReshapedNSavefile(self, arr, fn):
        posIdx = np.where(arr[:, 1] == 1)[0]
        negIdx = np.where(arr[:, 1] == 0)[0]
        dict = {
            'pos': np.unique(posIdx // self.T).tolist(),
            'neg': np.unique(negIdx // self.T).tolist(),
        }
        with open(fn, 'w') as fp:
            dump(dict, fp)

    def run(self, featureIdx, attnRange, attnRatio=None):
        #  ========== LOAD DATA, RESHAPE & FILTERING ===========
        # column [0:3] are 0:'attn', 1:'class', 2:'posId', 3:'seqId'
        # column [4:] are feature-length dimensional vector
        rnnStr = self.t + '-%03dEpoch-%.2f' % (self.epoch, self.accuracy)
        featureIdxStr = '%02d' % (featureIdx)
        if len(attnRatio) != 0 and attnRatio:
            attnSelectStr = 'p' + ('^').join([str(a)
                                              for a in sorted(attnRatio)])
        else:
            attnSelectStr = 'r' + ('-').join([str(a)
                                              for a in sorted(attnRange)])
        sampleSizeStr = str(self.sample_size)
        elbowStr = '%.01f' % self.elbow
        topKStr = str(self.topk)
        allStrs = [rnnStr, featureIdxStr, attnSelectStr,
                   sampleSizeStr, elbowStr, topKStr]
        fn = 'checkpoint-' + rnnStr + '_attentions_noa4vis.npy'
        arr = np.load(self.path + '/vis_data/' + fn)
        # print('arr.shape', arr.shape)  # (374400, 20) 'attn', 'class', 'posId', 'seqId', vecs...

        #  --- save attnRange and attenRatio portions (idx) ---
        #  --- to file if not yet ---
        dir = self.path + 'mid_data/'
        filteredAttnFN = dir + fn.replace('.npy', '_portion_idx.json')
        if not path.exists(filteredAttnFN):
            self.attnPortionsSaveFile(arr, filteredAttnFN)
        with open(filteredAttnFN, 'r') as f:
            attnPortionIdx = load(f)
        # print(attnPortionIdx.keys())  # ["0.0", "0.1" ..., "0.9"]

        filteredAttnPercentFN = dir + fn.replace('.npy', '_percents_idx.json')
        if not path.exists(filteredAttnPercentFN):
            self.attnPercentileSaveFile(arr, filteredAttnPercentFN)
        with open(filteredAttnPercentFN, 'r') as f:
            attnPercentileIdx = load(f)

        #   --- Reshape data and save reshaped to file if not yet ----
        reshapedAttnFN = dir + 'reshaped_' + fn
        if not path.exists(reshapedAttnFN):
            print('\nRESHAPING ATTENTION DATA')
            np.save(reshapedAttnFN, self.reshape(arr))  # all data
        print('\nREADING RESHAPED ATTENTION FILE...')
        reshapedAttn = np.load(reshapedAttnFN)  # (instance, time, feature)
        # print('reshaped attn data', reshapedAttn.shape)  # (2080, 180, 16)

        #   --- Get the index of pos and neg instances -----
        #   --- save index to file if not saved before -----
        posNegIdxFn = dir + fn.replace('.npy', '_posneg_idx.json')  # event idx
        if not path.exists(posNegIdxFn):
            self.posNegIdxConv2ReshapedNSavefile(arr, posNegIdxFn)
        with open(posNegIdxFn, 'r') as f:
            posNegIdx = load(f)
        posIdx = posNegIdx['pos']  # len: 990
        negIdx = posNegIdx['neg']  # len: 1090
        # print('posIdx', len(posIdx), posIdx[:10])  # 990 [1, 3, 6, 10, 11, ...
        # print('negIdx', len(negIdx), negIdx[:10])  # 1090 [0, 2, 4, 5, 7, 8 ...

        #   -------- FILTER ATTENTION (EVENTS) -----------
        #   --- Divide data into ten attention ranges
        #   --- and save to file if not done before
        #   ------- IF NOT DONE BEFORE, SAVE TO FILE -------
        #   --- Get the indices according to the selected attnRange or attnRatio
        pos_feature = reshapedAttn[:, :, featureIdx][posIdx]
        neg_feature = reshapedAttn[:, :, featureIdx][negIdx]

        if (len(attnRatio) == 0 and len(attnRange) == 0):
            pos = pos_feature
            neg = neg_feature
            pos0fill = pos_feature
            neg0fill = neg_feature
        else:
            selectedAttnIdx = []
            if len(attnRatio) != 0:
                for attnStart in attnRatio:
                    selectedAttnIdx += attnPercentileIdx['%.1f' % attnStart]
            elif len(attnRange) != 0:
                for attnStart in attnRange:
                    # print(attnPortionIdx[str(attnStart)])
                    selectedAttnIdx += attnPortionIdx['%.1f' % attnStart]
            instancebytime = len(arr)
            # shape (instance x time, 1)
            nanMask = np.array([False for i in range(instancebytime)])
            restIdx = list(set(range(instancebytime)) - set(selectedAttnIdx))
            # print('restIdx', len(restIdx))
            nanMask[restIdx] = True
            reshapedNanMask = np.reshape(
                nanMask, (instancebytime // self.T, self.T))
            # print('nanMask.shape', nanMask.shape)  # (374400,)
            # print('reshapedNanMask.shape', reshapedNanMask.shape)  # (2080, 180)

            # #   ------- SET VALUES not in AttnRange to Nan --------
            posAttnMask = reshapedNanMask[posIdx]
            maskedPos = np.ma.array(pos_feature, mask=posAttnMask)
            pos = np.ma.filled(maskedPos.astype(float), np.nan)
            # np.savetxt("posAfterAttnFitering.csv", pos, delimiter=",", fmt="%s") #check

            negAttnMask = reshapedNanMask[negIdx]
            maskedNeg = np.ma.array(neg_feature, mask=negAttnMask)
            neg = np.ma.filled(maskedNeg.astype(float), np.nan)
            # np.savetxt("negAfterAttnFitering.csv", neg, delimiter=",", fmt="%s") #check
            # print('pos.shape, neg.shape', pos.shape,
            #       neg.shape)  # (990, 180) (1090, 180)

            # fill nan with 0
            pos0fill = np.nan_to_num(pos)
            neg0fill = np.nan_to_num(neg)
            print('pos0fill.shape', pos0fill.shape)
            print('neg0fill.shape', neg0fill.shape)
        # =========== DATA LOADING, RESHAPE & FILTERING END. ===========

        # ---------- DATA SAMPLING ------
        # # sample for fair comparison and scalability
        if self.sample_size != 0:
            posNegSampleIdxFN = dir + '_'.join(allStrs[:-2]) + '.npz'
            if not path.exists(posNegSampleIdxFN):
                print('\nSAMPLING POS AND NEG ATTENTIONS.')
                posSampleIdx = self.sampling(pos0fill, self.sample_size)
                negSampleIdx = self.sampling(neg0fill, self.sample_size)
                np.savez(posNegSampleIdxFN, pos=posSampleIdx,
                         neg=negSampleIdx)
                print('\nDONE SAMPLING DATA.')
            # ---------- DATA SAMPLING END. (SAVED TO FILES) ------

            # ---------  LOADING SAMPLED DATA --------
            print('\nLOADING SAMPLED DATA INDEX.\n')
            posNegSampleIdx = np.load(posNegSampleIdxFN)
            # print('posNegSampleIdx', posNegSampleIdx)
            posSampled = pos[posNegSampleIdx['pos']]
            negSampled = neg[posNegSampleIdx['neg']]

            pos0fillSampled = pos0fill[posNegSampleIdx['pos']]
            neg0fillSampled = neg0fill[posNegSampleIdx['neg']]
            # print('\nDONE LOADING: pos/neg shape',
            #       posSampled.shape, negSampled.shape)
            # ---------  LOADING SAMPLED DATA END. --------
        else:  # no samping (self.sample_size == 0)
            posSampled = pos
            negSampled = neg
            pos0fillSampled = pos0fill
            neg0fillSampled = neg0fill

        # ---------  NOISE REDUCTION  --------
        noiseReductionFN = dir + '_'.join(allStrs[:-1]) + '.npz'
        # majorPosIdx = []
        # majorNegIdx = []
        if self.elbow == 0:
            majorPosIdx = [*range(len(pos0fillSampled))]
            majorNegIdx = [*range(len(neg0fillSampled))]
        else:
            if not path.exists(noiseReductionFN):
                print('\nCLUSTERING FOR NOISE REDUCTION.\n')
                posZ = hierarchy.linkage(pos0fillSampled, 'average')
                negZ = hierarchy.linkage(neg0fillSampled, 'average')
                # print(len(pos0fillSampled), len(posZ))
                # # plot distance curve to get elbow
                # plt.plot(range(len(posZ)), posZ[:,2], 'blue')
                # plt.plot(range(len(negZ)), negZ[:,2], 'red')
                # plt.show()
                print('\nDONE CLUSTERING FOR NOISE REDUCTION.')

                # # elbow
                print('\nDIVIDING SAMPLE INSTANCES USING ELBOW METHOD.\n')
                # majorPosIdx, minorPosIdx, membershipsPos = self.noiseReductElbow(posZ)
                # majorNegIdx, minorNegIdx, membershipsNeg = self.noiseReductElbow(negZ)
                majorPosIdx = self.noiseReductElbow(posZ)
                majorNegIdx = self.noiseReductElbow(negZ)
                print('\nDONE DIVIDING SAMPLE INSTANCES USING ELBOW METHOD.')
                np.savez(noiseReductionFN, pos=majorPosIdx,
                         neg=majorNegIdx)

            noiseReductionIdx = np.load(noiseReductionFN)
            majorPosIdx = noiseReductionIdx['pos']
            majorNegIdx = noiseReductionIdx['neg']
            # ---------  NOISE REDUCTION END.  --------

        # # ---------  CLUSTER NUMBER ESTIMATION  --------
        clusterNumEstimationFN = dir + '_'.join(allStrs[:-1]) + 'estK.npz'
        posZZ = hierarchy.linkage(pos0fillSampled[majorPosIdx], 'average')
        negZZ = hierarchy.linkage(neg0fillSampled[majorNegIdx], 'average')
        if not path.exists(clusterNumEstimationFN):
            print('\nGAP STATISTIC AUTO K ESTIMATION.\n')
            nref = 3
            maxClusters = 4
            posOptK = gapStatistic(
                pos0fill, pos0fillSampled[majorPosIdx], posZZ, nref, maxClusters)
            negOptK = gapStatistic(
                neg0fill, neg0fillSampled[majorNegIdx], negZZ, nref, maxClusters)
            print('\nDONE GAP STATISTIC AUTO K ESTIMATION.\n')
            np.savez(clusterNumEstimationFN, pos=posOptK, neg=negOptK)

        clusterNumEstimationResult = np.load(clusterNumEstimationFN)
        posOptK = clusterNumEstimationResult['pos']
        negOptK = clusterNumEstimationResult['neg']
        # # ---------  CLUSTER NUMBER ESTIMATION END.  --------

        # --------- INDEXING CLUSTERS --------
        print('\nINDEXING CLUSTERS.\n')
        clusterLabelFN = dir + '_'.join(allStrs) + '.npz'
        if not path.exists(clusterLabelFN):
            if self.topk == 1:
                posLabels = [0] * len(majorPosIdx)
                negLabels = [0] * len(majorNegIdx)
            else:
                posLabels = hierarchy.cut_tree(
                    posZZ, n_clusters=self.topk).flatten()
                negLabels = hierarchy.cut_tree(
                    negZZ, n_clusters=self.topk).flatten()
            np.savez(clusterLabelFN, pos=posLabels, neg=negLabels)
        posNegLabels = np.load(clusterLabelFN)
        posLabels = posNegLabels['pos']
        negLabels = posNegLabels['neg']
        print('\nDONE INDEXING CLUSTERS.\n')

        # -------- Calulate Cluster for Vis --------
        print('\nCOMPUTING CLUSTERS FOR VIS.\n')
        withNan = True
        topClusterVisPos = self.subClusters(
            pos0fillSampled, posSampled, withNan, majorPosIdx, posLabels, self.topk)
        topClusterVisNeg = self.subClusters(
            neg0fillSampled, negSampled, withNan, majorNegIdx, negLabels, self.topk)
        print('\nDONE COMPUTING CLUSTERS FOR VIS.\n')

        return {
            'clusters': {'pos': topClusterVisPos, 'neg': topClusterVisNeg},
            'estimatedK': int(min(posOptK, negOptK))
        }
