import os
import joblib
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, KFold, GridSearchCV
from sklearn.metrics import accuracy_score, classification_report, ConfusionMatrixDisplay, RocCurveDisplay
import matplotlib.pyplot as plt

from Speech_Model_SVC_Preprocessing import AudioFeatureExtractor


class SVCModel:
    def __init__(self, kernel='linear', test_size=0.2, random_state=42, cv_folds=5, model_name="svc_model"):
        self.kernel = kernel
        self.test_size = test_size
        self.random_state = random_state
        self.cv_folds = cv_folds
        self.model = SVC(kernel=self.kernel, probability=True, class_weight="balanced")
        self.features = None
        self.labels = None
        self.X_test = None
        self.y_test = None
        self.predictions = None
        self.model_name = model_name

        # Create output directory
        self.output_dir = os.path.join(os.getcwd(), self.model_name)
        os.makedirs(self.output_dir, exist_ok=True)

    def initialize(self, features, labels):
        self.features = features
        self.labels = labels

    def train(self):
        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            self.features, self.labels, test_size=self.test_size, random_state=self.random_state
        )

        # Train SVC model
        self.model.fit(X_train, y_train)
        self.X_test, self.y_test = X_test, y_test
        self.predictions = self.model.predict(X_test)

        # Evaluate the model
        accuracy = accuracy_score(y_test, self.predictions)
        report = classification_report(y_test, self.predictions)

        print(f"Accuracy: {accuracy}")
        print("Classification Report:")
        print(report)

        # Save classification report
        report_path = os.path.join(self.output_dir, "README.txt")
        with open(report_path, "w") as f:
            f.write(f"Accuracy: {accuracy}\n\n")
            f.write("Classification Report:\n")
            f.write(report)

        # Generate and save plots
        self._save_confusion_matrix()
        self._save_roc_curve()

    def _save_confusion_matrix(self):
        ConfusionMatrixDisplay.from_estimator(self.model, self.X_test, self.y_test)
        plt.title("Confusion Matrix")
        plot_path = os.path.join(self.output_dir, "confusion_matrix.png")
        plt.savefig(plot_path)
        plt.close()

    def _save_roc_curve(self):
        RocCurveDisplay.from_estimator(self.model, self.X_test, self.y_test)
        plt.title("ROC Curve")
        plot_path = os.path.join(self.output_dir, "roc_curve.png")
        plt.savefig(plot_path)
        plt.close()

    def kfold_validate(self):
        kfold = KFold(n_splits=self.cv_folds, shuffle=True, random_state=self.random_state)
        fold_accuracies = []

        for fold, (train_index, test_index) in enumerate(kfold.split(self.features)):
            X_train, X_test = self.features[train_index], self.features[test_index]
            y_train, y_test = self.labels[train_index], self.labels[test_index]

            # Train and evaluate on fold
            self.model.fit(X_train, y_train)
            predictions = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, predictions)
            fold_accuracies.append(accuracy)

        # Save fold accuracies plot
        self._save_kfold_accuracies(fold_accuracies)
        return fold_accuracies

    def _save_kfold_accuracies(self, fold_accuracies):
        plt.figure()
        plt.plot(range(1, len(fold_accuracies) + 1), fold_accuracies, marker='o', color='blue')
        plt.xlabel("Fold")
        plt.ylabel("Accuracy")
        plt.title("K-Fold Validation Accuracies")
        plot_path = os.path.join(self.output_dir, "kfold_accuracies.png")
        plt.savefig(plot_path)
        plt.close()

    def tune_hyperparameters(self, param_grid_sub):
        # Hyperparameter tuning with GridSearchCV
        grid_search = GridSearchCV(self.model, param_grid_sub, cv=self.cv_folds, scoring='accuracy')
        grid_search.fit(self.features, self.labels)

        # Set best model
        self.model = grid_search.best_estimator_
        best_params = grid_search.best_params_
        best_score = grid_search.best_score_

        # Save tuning results
        tuning_results_path = os.path.join(self.output_dir, "README.txt")
        with open(tuning_results_path, "a") as f:
            f.write("\nHyperparameter Tuning Results:\n")
            f.write(f"Best Parameters: {best_params}\n")
            f.write(f"Best Cross-Validation Score: {best_score}\n")

        return best_params, best_score

    def save_model(self, filename):
        # Save the model to a file using joblib
        model_path = os.path.join(self.output_dir, filename)
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")


if __name__ == "__main__":
    extractor = AudioFeatureExtractor()
    extractor.load_data()
    X, y = extractor.get_data()
    svc_model = SVCModel(kernel='rbf', cv_folds=5, model_name="svc_rbf_model")
    svc_model.initialize(X, y)
    svc_model.train()

    param_grid = {
        'kernel': ['linear', 'rbf'],
        'C': [0.1, 1, 10],
        'gamma': ['scale', 'auto']
    }
    svc_model.tune_hyperparameters(param_grid)
    svc_model.save_model("svc_trained_model.pkl")
