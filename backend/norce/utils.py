import numpy as np

class utils:
    def percentiles(arr, percents):
        percentileArr = []
        for col in range(len(arr[0])):
            values = arr[col]
            percentileArr.append([np.percentile(values, p) for p in percents])
        return percentileArr
