from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from supabase import create_client
from dotenv import load_dotenv
import numpy as np
import pandas as pd

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load models - adjust paths as needed
heart_failure_model = joblib.load('models/xgboost_heart_failure_model.pkl')
diabetes_model = joblib.load('models/rf_diabetes_model.pkl')
# diabetes_label_encoder = joblib.load('models/label_encoder.joblib')  # if needed

# Load Supabase credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_user_logs(user_id, bmi):
    features = [
        'systolic_bp_mmHg', 'diastolic_bp_mmHg',
        'heart_rate_bpm', 'glucose_mg_dL', 'sodium_mg_per_day',
        'physical_activity_min_per_week', 'sleep_quality_score_1_10',
        'stress_level_1_10', 'age_years', 'smoking_cigs_per_week',
        'alcohol_ml_per_week', 'previous_hypertensive_episodes', 'comorbidity_count'
    ]
    res = supabase.table('profiles').select(','.join(features)).eq('id', user_id).execute()
    if res.error or not res.data:
        return None
    df = pd.DataFrame(res.data)
    df['bmi'] = bmi  # Add BMI computed in frontend
    return df


def aggregate_features(df, relevant_features):
    if df is None or df.empty:
        return None
    for col in relevant_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    df.fillna(df.mean(numeric_only=True), inplace=True)
    agg = {}
    for f in relevant_features:
        if f == 'gender':
            agg[f] = df[f].iloc[0]
        else:
            agg[f] = df[f].mean()
    return np.array([agg[f] for f in relevant_features]).reshape(1, -1)


@app.route('/predict/stability_score', methods=['POST'])
def stability_score():
    try:
        data = request.json
        user_id = data.get('user_id')
        bmi = data.get('bmi')
        if not user_id or bmi is None:
            return jsonify({'error': 'Missing user_id or bmi'}), 400

        logs_df = fetch_user_logs(user_id, bmi)
        if logs_df is None or logs_df.empty:
            return jsonify({'error': 'No user data found'}), 404

        hf_features = [
            "systolic_bp_mmHg", "diastolic_bp_mmHg", "heart_rate_bpm",
            "age_years", "bmi", "comorbidity_count", "previous_hypertensive_episodes",
            "sleep_quality_score_1_10", "physical_activity_min_per_week",
            "stress_level_1_10", "smoking_cigs_per_week", "alcohol_ml_per_week"
        ]

        diabetes_features = [
            'bmi', 'systolic_bp_mmHg', 'diastolic_bp_mmHg',
            'glucose_mg_dL', 'physical_activity_min_per_week', 'age_years',
            'alcohol_ml_per_week', 'previous_hypertensive_episodes',
            'comorbidity_count'
        ]

        hf_input = aggregate_features(logs_df, hf_features)
        diabetes_input = aggregate_features(logs_df, diabetes_features)

        if hf_input is None or diabetes_input is None:
            return jsonify({'error': 'Insufficient data for prediction'}), 400

        hf_prob = heart_failure_model.predict_proba(hf_input)[0, 1]
        diabetes_prob = diabetes_model.predict_proba(diabetes_input)[0].max()

        avg_risk = (hf_prob + diabetes_prob) / 2
        stability_score = (1 - avg_risk) * 100

        return jsonify({
            'stability_score': round(float(stability_score), 2),
            'heart_failure_risk_prob': round(float(hf_prob), 4),
            'diabetes_risk_prob': round(float(diabetes_prob), 4)
        })

    except Exception as e:
        import traceback
        print("Error during stability_score prediction:", e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
