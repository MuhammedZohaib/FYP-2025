import librosa
import numpy as np
import os
import matplotlib.pyplot as plt


class AudioFeatureExtractor:
    def __init__(self, asd_dir='./dataset/ASD', non_asd_dir='./dataset/Non-ASD'):
        self.asd_dir = asd_dir
        self.non_asd_dir = non_asd_dir
        self.features = []
        self.labels = []
        self.mfcc = []

    @staticmethod
    def extract_features(file_path):
        y, sr = librosa.load(file_path, sr=None)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        return mfccs

    @staticmethod
    def plot_mfcc(mfcc):
        plt.figure()
        librosa.display.specshow(mfcc, x_axis='time')
        plt.colorbar()
        plt.title('MFCC')
        plt.tight_layout()
        plt.show()

    def load_data(self):
        for folder, label in [(self.asd_dir, 1), (self.non_asd_dir, 0)]:
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                try:
                    mfccs = self.extract_features(file_path.replace("\\", "/"))
                    self.mfcc.append(mfccs)
                    self.features.append(np.mean(mfccs.T, axis=0))
                    self.labels.append(label)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    def get_data(self):
        return np.array(self.features), np.array(self.labels)



