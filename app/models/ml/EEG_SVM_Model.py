from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, accuracy_score
import pandas as pd
import os
from sklearn.inspection import permutation_importance
import matplotlib.pyplot as plt
import joblib
from sklearn.calibration import CalibratedClassifierCV
import numpy as np


class SVMModel:
    def __init__(self, file_path_windows, linux_path):
        self.confidence_values = None
        self.file_path_win = file_path_windows
        self.file_path_linux = linux_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.svm_classifier = None
        self.param_grid = {'C': [0.1, 1, 10], 'gamma': ['scale', 'auto']}
        self.best_svm_classifier = None
        self.calibrated_classifier = None
        self.classification_rep = None
        self.accuracy = None
        self.y_pred = None
        self.feature_importance_file = None
        self.residual_probabilities = None

    def load_data(self):
        if os.path.exists(self.file_path_win):
            self.df = pd.read_excel(self.file_path_win)
        else:
            self.df = pd.read_excel(self.file_path_linux)

    def preprocess_data(self):
        self.df = self.df.drop_duplicates(subset=['subject_code'])
        self.df = self.df.dropna()

    def split_data(self, test_size=0.25, random_state=42):
        remove_cols = ['subject_code', 'diagnosis_group']
        X = self.df.drop(columns=remove_cols)
        y = self.df['diagnosis_group']
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(X, y, test_size=test_size,
                                                                                random_state=random_state)

    def train_model(self, kernel='rbf', C=1.0, gamma='scale', random_state=42):
        self.svm_classifier = SVC(kernel=kernel, C=C, gamma=gamma, random_state=random_state, probability=True)
        self.svm_classifier.fit(self.X_train, self.y_train)

    def evaluate_model(self):
        self.y_pred = self.svm_classifier.predict(self.X_test)
        self.classification_rep = classification_report(self.y_test, self.y_pred, output_dict=True)
        self.accuracy = accuracy_score(self.y_test, self.y_pred)

    def hyperparameter_tuning(self):
        grid_search = GridSearchCV(self.svm_classifier, self.param_grid, cv=5)
        grid_search.fit(self.X_train, self.y_train)
        self.best_svm_classifier = grid_search.best_estimator_

    def normalize_confidence(self):
        min_val = min(self.confidence_values)
        max_val = max(self.confidence_values)
        normalized_confidence = [(val - min_val) / (max_val - min_val) for val in self.confidence_values]
        return [round(val * 100, 2) for val in normalized_confidence]

    def predict(self, input_data, feature_names=None):
        if feature_names is not None:
            input_data_df = pd.DataFrame([input_data], columns=feature_names)
            input_data = input_data_df[self.X_train.columns].values[0]

        predicted_class = self.svm_classifier.predict([input_data])[0]
        confidence = None
        if hasattr(self.svm_classifier, "decision_function"):
            confidence = self.svm_classifier.decision_function([input_data])[0]
            confidence = max(SVMModel.normalize_confidence(confidence))
        return predicted_class, confidence

    def plot_feature_importance(self):
        result = permutation_importance(self.best_svm_classifier, self.X_train, self.y_train, n_repeats=10,
                                        random_state=42)
        sorted_idx = result.importances_mean.argsort()
        fig, ax = plt.subplots()
        ax.boxplot(result.importances[sorted_idx].T, vert=False)
        ax.set_title("Permutation Importance (test set)")
        fig.tight_layout()
        self.feature_importance_file = "feature_importance.png"
        plt.savefig(self.feature_importance_file)
        plt.close()

    def write_to_readme(self):
        with open('readme.md', 'w') as f:
            f.write("## Test Classification Report\n")
            f.write("```\n")
            f.write(classification_report(self.y_test, self.y_pred))
            f.write("\n```\n\n")
            f.write("Test Accuracy: {}\n\n".format(self.accuracy))
            f.write("## Feature Importance\n")
            f.write("![Feature Importance](feature_importance.png)\n")

    def initialize_and_train_model(self):
        self.load_data()
        self.preprocess_data()
        self.split_data()
        self.train_model()
        self.evaluate_model()
        self.hyperparameter_tuning()

    def train_calibrated_classifier(self):
        self.calibrated_classifier = CalibratedClassifierCV(self.best_svm_classifier, cv='prefit')
        self.calibrated_classifier.fit(self.X_train, self.y_train)

    def calc_residual_probabilities(self):
        probs = self.calibrated_classifier.predict_proba(self.X_train)
        y_train = self.y_train.to_numpy()
        residual_probs = []
        for i in range(len(y_train)):
            true_label = y_train[i]
            prob_true_label = probs[i][int(true_label)]
            residual_prob = 1 - prob_true_label
            residual_probs.append(residual_prob)

        residual_probs = np.array(residual_probs)
        return residual_probs

    def train_residual_probabilities(self):
        self.load_data()
        self.preprocess_data()
        self.split_data()
        self.train_model()
        self.evaluate_model()
        self.hyperparameter_tuning()
        self.train_calibrated_classifier()
        self.residual_probabilities = self.calc_residual_probabilities()

    def save_model(self, model_file):
        joblib.dump(self.calibrated_classifier, model_file)


if __name__ == "__main__":
    file_path_win = 'spectral_power_eeg_data.xlsx'
    file_path_linux = 'hadi/practical-work/code/spectral_power_eeg_data.xlsx'

    svm_model = SVMModel(file_path_win, file_path_linux)
    svm_model.train_residual_probabilities()
