from norce.NoRCE import NoRCE


filepath = './data/oulad/'
T = 180
SAMPLE_SIZE = 900
attnRange = []
time = '20200409-061253'

# best
# epoch = 23
# accuracy = 0.88
# print('batch preprocessing')
# for featureIdx in range(16):
#     for attnPercentile in [[0.7, 0.8, 0.9], [0.8, 0.9], [0.6, 0.7, 0.8, 0.9]]:
#         for elbow in [0, 0.1, 0.2]:
#             for topk in [1, 2, 3, 4]:
#                 norce_obj = NoRCE(filepath, time, epoch,
#                                   accuracy, T, SAMPLE_SIZE, topk, elbow)
#                 results = norce_obj.run(
#                     featureIdx, attnRange, attnRatio=attnPercentile)

# epoch = 0
# accuracy = 0.61
# print('batch preprocessing epoch', epoch, 'accuracy', accuracy)
# for featureIdx in range(16):
#     for attnPercentile in [[0.7, 0.8, 0.9], [0.8, 0.9], [0.6, 0.7, 0.8, 0.9]]:
#         for elbow in [0, 0.1, 0.2]:
#             for topk in [1, 2, 3, 4]:
#                 norce_obj = NoRCE(filepath, time, epoch,
#                                   accuracy, T, SAMPLE_SIZE, topk, elbow)
#                 results = norce_obj.run(
#                     featureIdx, attnRange, attnRatio=attnPercentile)

epoch = 2
accuracy = 0.79
print('batch preprocessing epoch', epoch, 'accuracy', accuracy)
for featureIdx in range(16):
    for attnPercentile in [[0.7, 0.8, 0.9], [0.8, 0.9], [0.6, 0.7, 0.8, 0.9]]:
        for elbow in [0, 0.1, 0.2]:
            for topk in [1, 2, 3, 4]:
                norce_obj = NoRCE(filepath, time, epoch,
                                  accuracy, T, SAMPLE_SIZE, topk, elbow)
                results = norce_obj.run(
                    featureIdx, attnRange, attnRatio=attnPercentile)


epoch = 8
accuracy = 0.84
print('batch preprocessing epoch', epoch, 'accuracy', accuracy)
for featureIdx in range(16):
    for attnPercentile in [[0.7, 0.8, 0.9], [0.8, 0.9], [0.6, 0.7, 0.8, 0.9]]:
        for elbow in [0, 0.1, 0.2]:
            for topk in [1, 2, 3, 4]:
                norce_obj = NoRCE(filepath, time, epoch,
                                  accuracy, T, SAMPLE_SIZE, topk, elbow)
                results = norce_obj.run(
                    featureIdx, attnRange, attnRatio=attnPercentile)
