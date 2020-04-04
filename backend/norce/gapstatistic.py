# -*- coding: utf-8 -*-
from scipy.cluster import hierarchy
# from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
from random import sample


def clusterCenters(X, labels, k):
    centers = []
    clusters = []
    for kk in range(k):
        cluster = []
        for xid, x in enumerate(labels):
            if (x == kk):
                cluster.append(X[xid])
        # print('cluster', np.array(cluster).shape)
        centers.append([[i for i in np.mean(cluster, axis=0)]])
        clusters.append(cluster)
    return centers, clusters


def Wk(mu, clusters):
    # K clusters
    # mu: cluster centers

    K = len(mu)
    return sum([np.linalg.norm(mu[i] - c)**2 / (2 * len(c)) for i in range(K) for c in clusters[i]])


def bounding_box(X):
    dim = X.shape[1]
    minMaxArr = []
    for d in range(dim):
        minMaxArr.append((min(X[:, d]), max(X[:, d])))

    return minMaxArr


def generateRandomVecs(Xshape, minMaxArr):
    Xb = []
    for n in range(Xshape[0]):
        x = []
        for d in range(Xshape[1]):
            x.append(np.random.uniform(minMaxArr[d][0], minMaxArr[d][1]))
        Xb.append(x)
    Xb = np.array(Xb)
    return Xb


def generateRandomVecsBySampling(original, Xshape):
    return original[sample(range(len(original)), Xshape[0])]
    # return sample(original, Xshape[0])


def gapStatistic(original, data, Z, nref=3, maxClusters=15):
    gaps = np.zeros((len(range(1, maxClusters)),))
    # gapdf = pd.DataFrame({'clusterCount':[], 'gap':[]})
    wkbs = np.zeros(len(range(1, maxClusters)))

    # minMaxArr = bounding_box(data)
    for gap_index, k in enumerate(range(1, maxClusters)):
        print('\ncalculating reference disp. K = ', k)

        # For n references, generate random sample
        # and get clustering result at each level k
        # Holder for reference dispersion results
        bWkbs = np.zeros(nref)
        for i in range(nref):
            # print('i', i)
            # Create new random reference set
            # randomReference = np.dot(np.random.random_sample(size=data.shape), maxx)
            # randomReference = generateRandomVecs(data.shape, minMaxArr)
            randomReference = generateRandomVecsBySampling(
                original, data.shape)

            # cluster to it
            refZ = hierarchy.linkage(randomReference, 'average')
            refClusterLabels = hierarchy.cut_tree(refZ, k)
            refCenters, refClusters = clusterCenters(
                randomReference, refClusterLabels, k)
            bWkbs[i] = np.log(Wk(refCenters, refClusters))

        # everage Wk for the reference sample groups
        wkbs[gap_index] = sum(bWkbs) / nref

        # cluster to original data and create dispersion
        print('\ncalculating original disp.')
        clusterLabels = hierarchy.cut_tree(Z, k)
        # print('clusterLabels', np.unique(clusterLabels))
        centers, clusters = clusterCenters(data, clusterLabels, k)

        # Calculate gap statistic
        gap = wkbs[gap_index] - np.log(Wk(centers, clusters))

        # Assign this loop's gap statistic to gaps
        gaps[gap_index] = gap

        # gapdf = gapdf.append({'clusterCount':k, 'gap':gap}, ignore_index=True)

    optK = gaps.argmax() + 1

    return optK
    # return optK, gapdf
    # return optK, optClusters, gapdf
