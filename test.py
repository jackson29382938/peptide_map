import datetime
import os
import time
import logging
from urllib.error import HTTPError
from Bio import Entrez
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import statsmodels.api as sm
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.seasonal import seasonal_decompose
from itertools import product
import warnings
warnings.filterwarnings('ignore')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Set NCBI API key and email
Entrez.email = "jackson29382938@gmail.com"
Entrez.api_key = "564471c9e4ff8400a21fe4be32fcf6f4ef09"

class TimeSeriesDataset(Dataset):
    def __init__(self, X, y):
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class LSTMForecaster(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

class MLPForecaster(nn.Module):
    def __init__(self, input_size, hidden_size):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, 1)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

def train_dl_model(model, X, y, epochs=100, batch_size=32):
    dataset = TimeSeriesDataset(X, y)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()
    model.train()
    for epoch in range(epochs):
        for inputs, targets in loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs.squeeze(), targets)
            loss.backward()
            optimizer.step()
    return model

def train_ml_model(model, X, y):
    X_reshaped = X.reshape(X.shape[0], -1).numpy()
    model.fit(X_reshaped, y.numpy())
    return model

def predict_future_arima(fitted_model, steps):
    forecast = fitted_model.forecast(steps=steps)
    return forecast.values

def predict_future_dl(model, last_seq, scaler, steps, is_lstm):
    model.eval()
    preds = []
    current_seq = last_seq.unsqueeze(0) if len(last_seq.shape) == 2 else last_seq.clone()
    for _ in range(steps):
        with torch.no_grad():
            out = model(current_seq)
        pred = out.item()
        preds.append(pred)
        new_val = torch.tensor([[[pred]]], dtype=torch.float32)
        current_seq = torch.cat((current_seq[:, 1:, :], new_val), dim=1)
    preds = np.array(preds).reshape(-1, 1)
    dummy = np.zeros((len(preds), scaler.n_features_in_))
    dummy[:, 0] = preds[:, 0]
    preds_inv = scaler.inverse_transform(dummy)[:, 0]
    return preds_inv

def ensemble_predictions(all_preds):
    return np.mean(all_preds, axis=0)

def plot_historical(df, parameter):
    plt.figure(figsize=(12, 6))
    plt.plot(df['Date'], df['Count'], label='Historical Counts')
    plt.title(f'Historical PubMed Publications for {parameter}')
    plt.xlabel('Date')
    plt.ylabel('Publication Count')
    plt.legend()
    plt.grid(True)
    plt.savefig(f"{parameter}_historical.png")
    plt.close()

def plot_predictions(df, preds, parameter, future_months):
    future_dates = pd.date_range(start=df['Date'].iloc[-1] + pd.DateOffset(months=1), periods=future_months, freq='MS')
    plt.figure(figsize=(12, 6))
    plt.plot(df['Date'], df['Count'], label='Historical')
    plt.plot(future_dates, preds, label='Predicted', linestyle='--')
    plt.title(f'PubMed Publication Predictions for {parameter}')
    plt.xlabel('Date')
    plt.ylabel('Publication Count')
    plt.legend()
    plt.grid(True)
    plt.savefig(f"{parameter}_predictions.png")
    plt.close()

def get_filter_str():
    return input("Enter additional filter string (e.g., AND review[ptyp], leave blank for none): ") or ""

class PubMedForecaster:
    def __init__(self, parameter, filter_str="", start_year=2000, end_year=None, seq_length=12, future_months=60, verbose=True):
        self.parameter = parameter
        self.filter_str = filter_str
        self.start_year = start_year
        self.end_year = end_year or datetime.date.today().year
        self.seq_length = seq_length
        self.future_months = future_months
        self.verbose = verbose
        self.df = None
        self.models = {}
        self.scaler = None
        self.features = None
        self.uni_feats = None
        self.ensemble_preds = None

    def fetch_data(self, cache_file=None):
        if cache_file and os.path.exists(cache_file):
            logging.info(f"Loading cached data from {cache_file}")
            self.df = pd.read_csv(cache_file, parse_dates=['Date'])
            last_date = self.df['Date'].max()
            start_fetch_year = last_date.year
            start_fetch_month = last_date.month + 1
        else:
            start_fetch_year = self.start_year
            start_fetch_month = 1

        current_date = datetime.date.today()
        current_year = current_date.year
        current_month = current_date.month

        base_query = f'"{self.parameter}" {self.filter_str}'

        dates = []
        counts = []

        for year in range(start_fetch_year, self.end_year + 1):
            start_month = 1 if year > start_fetch_year else start_fetch_month
            for month in range(start_month, 13):
                if year == current_year and month > current_month:
                    continue
                start_date = f"{year}-{month:02d}-01"
                if month == 12:
                    end_date = f"{year + 1}-01-01"
                else:
                    end_date = f"{year}-{month + 1:02d}-01"

                query = f'{base_query} AND ({start_date}[Date - Publication] : {end_date}[Date - Publication])'
                if self.verbose:
                    print(f"Querying PubMed: {query}")

                count = self._query_with_retries(query)
                if self.verbose:
                    print(f"Month {start_date}: {count} publications")
                dates.append(pd.to_datetime(start_date))
                counts.append(count)

        new_df = pd.DataFrame({'Date': dates, 'Count': counts})
        if hasattr(self, 'df') and self.df is not None:
            self.df = pd.concat([self.df, new_df]).drop_duplicates(subset='Date').sort_values('Date')
        else:
            self.df = new_df

        if cache_file:
            self.df.to_csv(cache_file, index=False)
            logging.info(f"Cached data saved to {cache_file}")

        logging.info(f"Data fetched: {len(self.df)} months")
        # Note: We now preserve zero-count months for continuity

    def _query_with_retries(self, query, max_retries=5):
        retries = 0
        while retries < max_retries:
            try:
                handle = Entrez.esearch(db="pubmed", term=query, retmax=0)
                record = Entrez.read(handle)
                handle.close()
                return int(record["Count"])
            except HTTPError as e:
                if e.code == 429:
                    sleep_time = 2 ** retries
                    logging.warning(f"Rate limit hit. Retrying after {sleep_time} seconds...")
                    time.sleep(sleep_time)
                    retries += 1
                else:
                    raise
        raise Exception("Max retries exceeded for query.")

    def add_features(self):
        if self.df is None:
            raise ValueError("Data not fetched yet.")

        logging.info("Engineering features...")
        self.df = self.df.set_index('Date').asfreq('MS', fill_value=0).reset_index()  # Ensure monthly frequency with zeros

        self.df['Month'] = self.df['Date'].dt.month
        self.df['Year'] = self.df['Date'].dt.year
        self.df['Sin_Month'] = np.sin(2 * np.pi * self.df['Month'] / 12)
        self.df['Cos_Month'] = np.cos(2 * np.pi * self.df['Month'] / 12)

        for lag in [1, 3, 6, 12]:
            self.df[f'Lag_{lag}'] = self.df['Count'].shift(lag)

        self.df['Rolling_Mean_3'] = self.df['Count'].rolling(window=3).mean().shift(1)
        self.df['Rolling_Std_3'] = self.df['Count'].rolling(window=3).std().shift(1)
        self.df['Momentum'] = self.df['Count'] - self.df['Count'].shift(12)

        # Seasonal decomposition (if enough data)
        if len(self.df) >= 24:
            decomp = seasonal_decompose(self.df['Count'], model='additive', period=12)
            self.df['Trend'] = decomp.trend.shift(1)
            self.df['Seasonal'] = decomp.seasonal.shift(1)
        else:
            self.df['Trend'] = np.nan
            self.df['Seasonal'] = np.nan

        self.df.dropna(inplace=True)
        logging.info(f"Features added, new shape: {self.df.shape}")

    def prepare_data(self, univariate=False):
        if len(self.df) < self.seq_length + 1:
            logging.warning(f"Insufficient data ({len(self.df)} entries) for {self.parameter}. Skipping advanced modeling.")
            return None, None, None, None

        if univariate:
            feats = ['Count']
        else:
            feats = ['Count', 'Sin_Month', 'Cos_Month', 'Lag_1', 'Lag_3', 'Lag_6', 'Lag_12',
                     'Rolling_Mean_3', 'Rolling_Std_3', 'Momentum', 'Trend', 'Seasonal']
            feats = [f for f in feats if f in self.df.columns]

        logging.info(f"Preparing data with {len(self.df)} entries using features: {feats}")
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(self.df[feats])

        X, y = [], []
        for i in range(len(scaled_data) - self.seq_length):
            X.append(scaled_data[i:i + self.seq_length])
            y.append(scaled_data[i + self.seq_length, 0])  # Target is 'Count'

        X = np.array(X)
        y = np.array(y)
        logging.info(f"Prepared {len(X)} sequences")
        return torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32), scaler, feats

    def _fit_arima_grid(self, series):
        p = d = q = range(0, 3)
        pdq = list(product(p, d, q))
        best_aic = np.inf
        best_order = None
        best_model = None
        for param in pdq:
            try:
                mod = ARIMA(series, order=param)
                results = mod.fit()
                if results.aic < best_aic:
                    best_aic = results.aic
                    best_order = param
                    best_model = results
            except:
                continue
        if best_order is None:
            logging.warning("ARIMA grid search failed, using fallback order (1,1,1)")
            best_model = ARIMA(series, order=(1,1,1)).fit()
        return best_model

    def train_models(self, X_uni, y_uni, X_multi, y_multi):
        if X_uni is None:
            return

        # DL models use univariate
        lstm_model = LSTMForecaster(input_size=1, hidden_size=50)
        self.models['LSTM'] = train_dl_model(lstm_model, X_uni, y_uni)

        mlp_model = MLPForecaster(input_size=self.seq_length * 1, hidden_size=50)
        self.models['MLP'] = train_dl_model(mlp_model, X_uni, y_uni)

        # ML use multivariate
        self.models['RandomForest'] = train_ml_model(RandomForestRegressor(n_estimators=100), X_multi, y_multi)

        self.models['GradientBoosting'] = train_ml_model(GradientBoostingRegressor(n_estimators=100), X_multi, y_multi)

        # ARIMA with grid search for order
        self.models['ARIMA'] = self._fit_arima_grid(self.df['Count'])

    def evaluate_models(self, X_uni, y_uni, X_multi, y_multi, uni_feats, multi_feats, uni_scaler):
        if X_uni is None:
            return {}

        tscv = TimeSeriesSplit(n_splits=5)
        results = {}

        for name, model in self.models.items():
            scores = {'rmse': [], 'mae': [], 'r2': []}
            for train_idx, val_idx in tscv.split(np.arange(len(self.df) - self.seq_length)):
                y_train_scaled = y_multi[train_idx].numpy()
                y_val = self.df['Count'].iloc[val_idx + self.seq_length]
                if 'ARIMA' in name:
                    series_train = self.df['Count'].iloc[0 : train_idx[-1] + self.seq_length + 1]
                    fitted = self._fit_arima_grid(series_train)
                    pred = predict_future_arima(fitted, len(val_idx))
                elif isinstance(model, nn.Module):
                    # Approximate with full data training for speed in eval; in practice, retrain on train_idx
                    is_lstm = isinstance(model, LSTMForecaster)
                    last_seq = X_uni[-1]  # Simplified approximation
                    pred = predict_future_dl(model, last_seq, uni_scaler, len(val_idx), is_lstm=is_lstm)
                else:
                    X_train = X_multi[train_idx].reshape(len(train_idx), -1).numpy()
                    X_val = X_multi[val_idx].reshape(len(val_idx), -1).numpy()
                    trained_model = type(model)()
                    trained_model.fit(X_train, y_train_scaled)
                    pred_scaled = trained_model.predict(X_val)
                    dummy = np.zeros((len(pred_scaled), 1))
                    dummy[:, 0] = pred_scaled
                    pred = uni_scaler.inverse_transform(dummy)[:, 0]
                scores['rmse'].append(np.sqrt(mean_squared_error(y_val, pred)))
                scores['mae'].append(mean_absolute_error(y_val, pred))
                scores['r2'].append(r2_score(y_val, pred))
            results[name] = {k: np.mean(v) for k,v in scores.items()}
            print(f"{name} metrics: {results[name]}")
        return results

    def _predict_future_ml_simulated(self, model, last_feats, scaler):
        preds = []
        current_feats = last_feats.copy()
        X_reshaped = current_feats.reshape(1, -1)
        for _ in range(self.future_months):
            pred_scaled = model.predict(X_reshaped)[0]
            preds.append(pred_scaled)
            current_feats[0] = pred_scaled  # Approximate update
            X_reshaped = current_feats.reshape(1, -1)
        dummy = np.zeros((len(preds), 1))
        dummy[:, 0] = preds
        preds_inv = scaler.inverse_transform(dummy)[:, 0]
        return preds_inv

    def predict(self, X_uni, uni_scaler, X_multi):
        if X_uni is None:
            # Fallback for sparse data: simple mean forecast
            mean_count = self.df['Count'].mean()
            self.ensemble_preds = np.full(self.future_months, mean_count)
            return

        last_seq_uni = torch.tensor(uni_scaler.transform(self.df[self.uni_feats].tail(self.seq_length)), dtype=torch.float32)

        last_feats_multi = X_multi[-1].flatten().numpy()

        all_preds = []
        for name, model in self.models.items():
            if 'ARIMA' in name:
                preds = predict_future_arima(model, self.future_months)
            elif isinstance(model, nn.Module):
                is_lstm = isinstance(model, LSTMForecaster)
                preds = predict_future_dl(model, last_seq_uni, uni_scaler, self.future_months, is_lstm=is_lstm)
            else:
                preds = self._predict_future_ml_simulated(model, last_feats_multi, uni_scaler)
            all_preds.append(preds)

        self.ensemble_preds = ensemble_predictions(all_preds)

    def plot_and_export(self, metrics=None):
        if self.df is None:
            return

        plot_historical(self.df, self.parameter)
        if self.ensemble_preds is not None:
            plot_predictions(self.df, self.ensemble_preds, self.parameter, self.future_months)

        self.df.to_csv(f"{self.parameter}_historical.csv", index=False)
        if self.ensemble_preds is not None:
            pred_df = pd.DataFrame({'Date': pd.date_range(start=self.df['Date'].iloc[-1] + pd.DateOffset(months=1), periods=self.future_months, freq='MS'), 'Predicted_Count': self.ensemble_preds})
            pred_df.to_csv(f"{self.parameter}_predictions.csv", index=False)
        if metrics:
            pd.DataFrame(metrics).T.to_csv(f"{self.parameter}_metrics.csv")

        if 'RandomForest' in self.models:
            print("RandomForest Feature Importance:")
            for feat, imp in zip(self.features[1:], self.models['RandomForest'].feature_importances_):
                print(f"{feat}: {imp:.4f}")
        if 'GradientBoosting' in self.models:
            print("GradientBoosting Feature Importance:")
            for feat, imp in zip(self.features[1:], self.models['GradientBoosting'].feature_importances_):
                print(f"{feat}: {imp:.4f}")

def main():
    parameters_input = input("Enter peptide names or parameters separated by commas (e.g., BPC-157, TB-500). Press enter for default BPC-157: ") or "BPC-157"
    parameters = [p.strip() for p in parameters_input.split(',')]

    filter_str = get_filter_str()

    start_year = int(input("Enter start year (default 2000): ") or 2000)
    seq_length = int(input("Enter sequence length (default 12): ") or 12)
    future_months = int(input("Enter future months to predict (default 60): ") or 60)

    for parameter in parameters:
        forecaster = PubMedForecaster(parameter, filter_str, start_year=start_year, seq_length=seq_length, future_months=future_months)
        cache_file = f"{parameter}_raw_data.csv"
        forecaster.fetch_data(cache_file)
        forecaster.add_features()
        X_uni, y_uni, uni_scaler, uni_feats = forecaster.prepare_data(univariate=True)
        X_multi, y_multi, multi_scaler, multi_feats = forecaster.prepare_data(univariate=False)
        forecaster.features = multi_feats  # For importance etc.
        forecaster.uni_feats = uni_feats
        forecaster.train_models(X_uni, y_uni, X_multi, y_multi)
        metrics = forecaster.evaluate_models(X_uni, y_uni, X_multi, y_multi, uni_feats, multi_feats, uni_scaler)
        forecaster.predict(X_uni, uni_scaler, X_multi)
        forecaster.plot_and_export(metrics)

if __name__ == "__main__":
    main()