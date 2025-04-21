"""
Trains a classical ML model (Random Forest) on transactions labeled via naive keyword rules.
The goal is to create a strong baseline classifier that can generalize patterns in transaction text.

Uses TF-IDF for feature extraction and Optuna for hyperparameter tuning.

Saves:
- Trained model (random_forest_model.pkl)
- TF-IDF vectorizer (tfidf_vectorizer.pkl)
- Updated dataset with model predictions (MLCategory column)
"""
``


import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score
import optuna
import joblib

df = pd.read_csv("checkpoint_naive_10k.csv")

X_train, X_test, y_train, y_test = train_test_split(
    df['TRANSACTION DETAILS'], df['NaiveCategory'], test_size=0.2, random_state=42
)

# Text vectorization
vec = TfidfVectorizer(max_features=1000)
X_train_vec = vec.fit_transform(X_train)
X_test_vec = vec.transform(X_test)

# Hyperparameter tuning with Optuna
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 200),
        'max_depth': trial.suggest_int('max_depth', 5, 30),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 4)
    }
    model = RandomForestClassifier(**params, random_state=42)
    model.fit(X_train_vec, y_train)
    preds = model.predict(X_test_vec)
    return f1_score(y_test, preds, average='weighted')

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=20)
best_params = study.best_params

# Final model training
clf = RandomForestClassifier(**best_params, random_state=42)
clf.fit(X_train_vec, y_train)

# Save model and vectorizer
joblib.dump(clf, "random_forest_model.pkl")
joblib.dump(vec, "tfidf_vectorizer.pkl")
print("Saved Random Forest model and vectorizer.")

# Predict on all data
df['MLCategory'] = clf.predict(vec.transform(df['TRANSACTION DETAILS']))
df.to_csv("checkpoint_rf_labeled.csv", index=False)
print("Added MLCategory column and saved.")
