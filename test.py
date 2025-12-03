import datetime
import os
import time
import logging
from urllib.error import HTTPError
from Bio import Entrez
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.express as px
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import statsmodels.api as sm
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from itertools import product
import warnings
import json
warnings.filterwarnings('ignore')

# Configure matplotlib for high-quality output
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('forecaster.log'),
        logging.StreamHandler()
    ]
)

# Set NCBI API key and email
Entrez.email = "jackson29382938@gmail.com"
Entrez.api_key = "564471c9e4ff8400a21fe4be32fcf6f4ef09"


class TimeSeriesDataset(Dataset):
    """Enhanced dataset with augmentation capabilities"""
    def __init__(self, X, y, augment=False):
        self.X = X
        self.y = y
        self.augment = augment

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        x, y = self.X[idx], self.y[idx]
        if self.augment and np.random.rand() > 0.5:
            # Add small noise for augmentation
            x = x + torch.randn_like(x) * 0.01
        return x, y


class AttentionLSTM(nn.Module):
    """LSTM with attention mechanism"""
    def __init__(self, input_size, hidden_size, num_layers=2, dropout=0.2):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.attention = nn.Linear(hidden_size, 1)
        self.fc = nn.Linear(hidden_size, 1)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        
        # Attention mechanism
        attn_weights = torch.softmax(self.attention(lstm_out), dim=1)
        context = torch.sum(attn_weights * lstm_out, dim=1)
        
        output = self.fc(self.dropout(context))
        return output


class TransformerForecaster(nn.Module):
    """Transformer-based forecaster"""
    def __init__(self, input_size, d_model=64, nhead=4, num_layers=2, dropout=0.1):
        super().__init__()
        self.input_projection = nn.Linear(input_size, d_model)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc = nn.Linear(d_model, 1)

    def forward(self, x):
        x = self.input_projection(x)
        x = self.transformer(x)
        return self.fc(x[:, -1, :])


class ResidualBlock(nn.Module):
    """Residual block for deep networks"""
    def __init__(self, hidden_size, dropout=0.2):
        super().__init__()
        self.fc1 = nn.Linear(hidden_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.dropout = nn.Dropout(dropout)
        self.bn1 = nn.BatchNorm1d(hidden_size)
        self.bn2 = nn.BatchNorm1d(hidden_size)

    def forward(self, x):
        residual = x
        x = torch.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)
        x = self.bn2(self.fc2(x))
        x += residual
        return torch.relu(x)


class DeepMLPForecaster(nn.Module):
    """Deep MLP with residual connections"""
    def __init__(self, input_size, hidden_size=128, num_blocks=3, dropout=0.2):
        super().__init__()
        self.input_fc = nn.Linear(input_size, hidden_size)
        self.blocks = nn.ModuleList([
            ResidualBlock(hidden_size, dropout) for _ in range(num_blocks)
        ])
        self.output_fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = torch.relu(self.input_fc(x))
        for block in self.blocks:
            x = block(x)
        return self.output_fc(x)


def train_dl_model(model, X, y, epochs=200, batch_size=32, patience=20, lr=0.001):
    """Enhanced training with early stopping and learning rate scheduling"""
    dataset = TimeSeriesDataset(X, y, augment=True)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=10
    )
    criterion = nn.MSELoss()
    
    model.train()
    best_loss = float('inf')
    patience_counter = 0
    train_losses = []
    
    for epoch in range(epochs):
        epoch_loss = 0
        for inputs, targets in loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs.squeeze(), targets)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / len(loader)
        train_losses.append(avg_loss)
        scheduler.step(avg_loss)
        
        if avg_loss < best_loss:
            best_loss = avg_loss
            patience_counter = 0
        else:
            patience_counter += 1
        
        if patience_counter >= patience:
            logging.info(f"Early stopping at epoch {epoch+1}")
            break
    
    return model, train_losses


def create_beautiful_static_plots(df, preds, parameter, future_months, confidence_intervals=None):
    """Create publication-quality static plots"""
    future_dates = pd.date_range(
        start=df['Date'].iloc[-1] + pd.DateOffset(months=1),
        periods=future_months,
        freq='MS'
    )
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 12))
    gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)
    
    # Main forecast plot
    ax1 = fig.add_subplot(gs[0:2, :])
    ax1.plot(df['Date'], df['Count'], 
             label='Historical Data', 
             color='#2E86AB', linewidth=2.5, marker='o', 
             markersize=3, markerfacecolor='white', markeredgewidth=1.5,
             alpha=0.9, zorder=3)
    
    ax1.plot(future_dates, preds, 
             label='Ensemble Forecast', 
             color='#A23B72', linewidth=2.5, linestyle='--',
             marker='s', markersize=4, markerfacecolor='white',
             markeredgewidth=1.5, alpha=0.9, zorder=3)
    
    # Add confidence intervals if available
    if confidence_intervals is not None:
        ax1.fill_between(future_dates, 
                         confidence_intervals['lower'],
                         confidence_intervals['upper'],
                         alpha=0.2, color='#A23B72', label='95% Confidence Interval')
    
    # Styling
    ax1.set_title(f'PubMed Publication Forecast: {parameter}', 
                  fontsize=20, fontweight='bold', pad=20)
    ax1.set_xlabel('Date', fontsize=14, fontweight='bold')
    ax1.set_ylabel('Publication Count', fontsize=14, fontweight='bold')
    ax1.legend(fontsize=12, frameon=True, shadow=True, fancybox=True)
    ax1.grid(True, alpha=0.3, linestyle='--', linewidth=0.5)
    ax1.set_facecolor('#F8F9FA')
    
    # Format x-axis
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
    ax1.xaxis.set_major_locator(mdates.YearLocator())
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # Year-over-year growth
    ax2 = fig.add_subplot(gs[2, 0])
    
    # Historical yearly data
    yearly_data = df.groupby(df['Date'].dt.year)['Count'].sum()
    
    # Predicted yearly data
    pred_df = pd.DataFrame({'Date': future_dates, 'Count': preds})
    yearly_preds = pred_df.groupby(pred_df['Date'].dt.year)['Count'].sum()
    
    # Combine for x-axis range but plot separately
    all_years = sorted(list(set(yearly_data.index) | set(yearly_preds.index)))
    
    # Plot historical
    colors_hist = plt.cm.viridis(np.linspace(0.3, 0.9, len(yearly_data)))
    bars_hist = ax2.bar(yearly_data.index, yearly_data.values, color=colors_hist, 
                   edgecolor='black', linewidth=1.5, alpha=0.8, label='Historical')
                   
    # Plot predicted
    # Use a distinct color for predictions (e.g., the forecast color used in main plot)
    bars_pred = ax2.bar(yearly_preds.index, yearly_preds.values, color='#A23B72', 
                   edgecolor='black', linewidth=1.5, alpha=0.6, hatch='//', label='Forecast')
    
    ax2.set_title('Annual Publication Volume (Historical & Forecast)', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Total Publications', fontsize=12, fontweight='bold')
    ax2.grid(True, alpha=0.3, axis='y')
    ax2.set_facecolor('#F8F9FA')
    ax2.legend()
    
    # Add value labels on bars
    for bar in bars_hist:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}', ha='center', va='bottom', fontsize=9)
                
    for bar in bars_pred:
        height = bar.get_height()
        if np.isfinite(height):
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom', fontsize=9, color='#A23B72', fontweight='bold')
    
    # Monthly distribution heatmap
    ax3 = fig.add_subplot(gs[2, 1])
    monthly_avg = df.groupby(df['Date'].dt.month)['Count'].mean()
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    colors_heat = plt.cm.RdYlGn(np.linspace(0.3, 0.9, len(monthly_avg)))
    bars = ax3.barh(month_names, monthly_avg.values, color=colors_heat,
                    edgecolor='black', linewidth=1.5, alpha=0.8)
    ax3.set_title('Average Publications by Month', fontsize=14, fontweight='bold')
    ax3.set_xlabel('Average Count', fontsize=12, fontweight='bold')
    ax3.grid(True, alpha=0.3, axis='x')
    ax3.set_facecolor('#F8F9FA')
    
    plt.tight_layout()
    plt.savefig(f"{parameter}_comprehensive_analysis.png", 
                bbox_inches='tight', facecolor='white', edgecolor='none')
    plt.close()
    
    logging.info(f"Beautiful static plot saved: {parameter}_comprehensive_analysis.png")


def create_interactive_dashboard(df, preds, parameter, future_months, model_predictions=None, metrics=None):
    """Create an advanced interactive dashboard with Plotly"""
    future_dates = pd.date_range(
        start=df['Date'].iloc[-1] + pd.DateOffset(months=1),
        periods=future_months,
        freq='MS'
    )
    
    # Create subplots
    fig = make_subplots(
        rows=3, cols=2,
        subplot_titles=(
            'Historical Data & Forecast',
            'Model Comparison',
            'Trend Decomposition',
            'Growth Rate Analysis',
            'Prediction Uncertainty',
            'Feature Importance'
        ),
        specs=[
            [{"colspan": 2}, None],
            [{"type": "xy"}, {"type": "xy"}],
            [{"type": "xy"}, {"type": "bar"}]
        ],
        vertical_spacing=0.12,
        horizontal_spacing=0.15
    )
    
    # 1. Main forecast plot with enhanced styling
    fig.add_trace(
        go.Scatter(
            x=df['Date'], y=df['Count'],
            name='Historical',
            mode='lines+markers',
            line=dict(color='#2E86AB', width=3),
            marker=dict(size=6, color='white', line=dict(color='#2E86AB', width=2)),
            hovertemplate='<b>Date</b>: %{x}<br><b>Count</b>: %{y}<extra></extra>'
        ),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(
            x=future_dates, y=preds,
            name='Ensemble Forecast',
            mode='lines+markers',
            line=dict(color='#A23B72', width=3, dash='dash'),
            marker=dict(size=8, symbol='square', color='white', 
                       line=dict(color='#A23B72', width=2)),
            hovertemplate='<b>Date</b>: %{x}<br><b>Predicted</b>: %{y:.0f}<extra></extra>'
        ),
        row=1, col=1
    )
    
    # Add confidence bands
    std_dev = np.std(df['Count'].tail(24))
    upper_bound = preds + 1.96 * std_dev
    lower_bound = np.maximum(preds - 1.96 * std_dev, 0)
    
    fig.add_trace(
        go.Scatter(
            x=future_dates, y=upper_bound,
            fill=None, mode='lines',
            line=dict(color='rgba(162, 59, 114, 0)'),
            showlegend=False,
            hoverinfo='skip'
        ),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(
            x=future_dates, y=lower_bound,
            fill='tonexty',
            mode='lines',
            line=dict(color='rgba(162, 59, 114, 0)'),
            fillcolor='rgba(162, 59, 114, 0.2)',
            name='95% CI',
            hovertemplate='<b>Upper</b>: %{y:.0f}<extra></extra>'
        ),
        row=1, col=1
    )
    
    # 2. Model comparison (if available)
    if model_predictions:
        for model_name, model_preds in model_predictions.items():
            fig.add_trace(
                go.Scatter(
                    x=future_dates, y=model_preds,
                    name=model_name,
                    mode='lines',
                    line=dict(width=2),
                    opacity=0.6,
                    hovertemplate=f'<b>{model_name}</b><br>%{{y:.0f}}<extra></extra>'
                ),
                row=2, col=1
            )
    
    # 3. Trend decomposition
    if len(df) >= 24:
        decomp = seasonal_decompose(df['Count'], model='additive', period=12)
        fig.add_trace(
            go.Scatter(
                x=df['Date'], y=decomp.trend,
                name='Trend',
                line=dict(color='#F18F01', width=3),
                hovertemplate='<b>Trend</b>: %{y:.1f}<extra></extra>'
            ),
            row=2, col=2
        )
    
    # 4. Growth rate analysis
    growth_rate = df['Count'].pct_change(12) * 100  # Year-over-year
    fig.add_trace(
        go.Scatter(
            x=df['Date'], y=growth_rate,
            name='YoY Growth',
            mode='lines',
            line=dict(color='#06A77D', width=2),
            fill='tozeroy',
            fillcolor='rgba(6, 167, 125, 0.2)',
            hovertemplate='<b>Growth Rate</b>: %{y:.1f}%<extra></extra>'
        ),
        row=3, col=1
    )
    
    fig.add_hline(y=0, line_dash="dash", line_color="gray", 
                  opacity=0.5, row=3, col=1)
    
    # 5. Metrics display (if available)
    if metrics:
        metric_names = list(metrics.keys())
        rmse_values = [metrics[m]['rmse'] for m in metric_names]
        
        fig.add_trace(
            go.Bar(
                x=metric_names, y=rmse_values,
                name='RMSE',
                marker=dict(
                    color=rmse_values,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="RMSE", x=1.15)
                ),
                text=[f'{v:.2f}' for v in rmse_values],
                textposition='outside',
                hovertemplate='<b>%{x}</b><br>RMSE: %{y:.2f}<extra></extra>'
            ),
            row=3, col=2
        )
    
    # Update layout
    fig.update_layout(
        title=dict(
            text=f'<b>Advanced Publication Forecast Dashboard: {parameter}</b>',
            font=dict(size=24, color='#1a1a1a'),
            x=0.5,
            xanchor='center'
        ),
        height=1400,
        showlegend=True,
        hovermode='x unified',
        plot_bgcolor='#F8F9FA',
        paper_bgcolor='white',
        font=dict(family='Arial, sans-serif', size=12),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            bgcolor='rgba(255,255,255,0.8)',
            bordercolor='#E5E5E5',
            borderwidth=1
        )
    )
    
    # Update axes
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='#E5E5E5')
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='#E5E5E5')
    
    # Save as HTML
    html_file = f"{parameter}_interactive_dashboard.html"
    fig.write_html(
        html_file,
        config={
            'displayModeBar': True,
            'displaylogo': False,
            'modeBarButtonsToRemove': ['select2d', 'lasso2d'],
            'toImageButtonOptions': {
                'format': 'png',
                'filename': f'{parameter}_dashboard',
                'height': 1400,
                'width': 1400,
                'scale': 2
            }
        }
    )
    
    logging.info(f"Interactive dashboard saved: {html_file}")
    return fig


class PubMedForecaster:
    def __init__(self, parameter, filter_str="", start_year=2000, end_year=None, 
                 seq_length=12, future_months=60, verbose=True):
        self.parameter = parameter
        self.filter_str = filter_str
        self.start_year = start_year
        self.end_year = end_year or datetime.date.today().year
        self.seq_length = seq_length
        self.future_months = future_months
        self.verbose = verbose
        self.df = None
        self.df_full = None  # Store full data before feature engineering
        self.models = {}
        self.model_predictions = {}
        self.scaler = None
        self.features = None
        self.uni_feats = None
        self.ensemble_preds = None

    def fetch_data(self, cache_file=None):
        """Fetch data with improved caching and error handling"""
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
        dates, counts = [], []

        for year in range(start_fetch_year, self.end_year + 1):
            start_month = 1 if year > start_fetch_year else start_fetch_month
            for month in range(start_month, 13):
                if year == current_year and month > current_month:
                    continue
                    
                start_date = f"{year}-{month:02d}-01"
                end_date = f"{year + 1}-01-01" if month == 12 else f"{year}-{month + 1:02d}-01"
                
                query = f'{base_query} AND ({start_date}[Date - Publication] : {end_date}[Date - Publication])'
                
                if self.verbose:
                    print(f"Querying: {start_date}")
                
                count = self._query_with_retries(query)
                dates.append(pd.to_datetime(start_date))
                counts.append(count)

        new_df = pd.DataFrame({'Date': dates, 'Count': counts})
        
        if hasattr(self, 'df') and self.df is not None:
            self.df = pd.concat([self.df, new_df]).drop_duplicates(subset='Date').sort_values('Date')
        else:
            self.df = new_df

        if cache_file:
            self.df.to_csv(cache_file, index=False)
            logging.info(f"Data cached to {cache_file}")

        logging.info(f"Total data points: {len(self.df)}")

    def _query_with_retries(self, query, max_retries=5):
        """Query with exponential backoff"""
        for attempt in range(max_retries):
            try:
                handle = Entrez.esearch(db="pubmed", term=query, retmax=0)
                record = Entrez.read(handle)
                handle.close()
                return int(record["Count"])
            except HTTPError as e:
                if e.code == 429:
                    wait_time = 2 ** attempt
                    logging.warning(f"Rate limited. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise
        raise Exception("Max retries exceeded")

    def add_features(self):
        """Enhanced feature engineering with robust handling of edge cases"""
        if self.df is None:
            raise ValueError("Data not fetched")

        logging.info("Engineering advanced features...")
        
        # Store full data before feature engineering for visualization
        self.df_full = self.df.copy()
        
        self.df = self.df.set_index('Date').asfreq('MS', fill_value=0).reset_index()

        # Temporal features
        self.df['Month'] = self.df['Date'].dt.month
        self.df['Year'] = self.df['Date'].dt.year
        self.df['Quarter'] = self.df['Date'].dt.quarter
        self.df['Sin_Month'] = np.sin(2 * np.pi * self.df['Month'] / 12)
        self.df['Cos_Month'] = np.cos(2 * np.pi * self.df['Month'] / 12)
        self.df['Sin_Quarter'] = np.sin(2 * np.pi * self.df['Quarter'] / 4)
        self.df['Cos_Quarter'] = np.cos(2 * np.pi * self.df['Quarter'] / 4)

        # Lag features (only if we have enough data)
        max_lag = min(24, len(self.df) // 3)  # Don't use lags beyond 1/3 of data
        for lag in [1, 2, 3, 6, 12]:
            if lag <= max_lag:
                self.df[f'Lag_{lag}'] = self.df['Count'].shift(lag)

        # Rolling statistics (with robust handling)
        for window in [3, 6, 12]:
            if len(self.df) >= window + 1:
                self.df[f'Rolling_Mean_{window}'] = self.df['Count'].rolling(
                    window=window, min_periods=1
                ).mean().shift(1)
                
                # Handle std which can be 0
                self.df[f'Rolling_Std_{window}'] = self.df['Count'].rolling(
                    window=window, min_periods=1
                ).std().shift(1)
                self.df[f'Rolling_Std_{window}'].fillna(0, inplace=True)
                
                self.df[f'Rolling_Min_{window}'] = self.df['Count'].rolling(
                    window=window, min_periods=1
                ).min().shift(1)
                
                self.df[f'Rolling_Max_{window}'] = self.df['Count'].rolling(
                    window=window, min_periods=1
                ).max().shift(1)

        # Growth and momentum (with safe handling)
        if len(self.df) >= 13:
            self.df['Momentum_12'] = self.df['Count'] - self.df['Count'].shift(12)
            # Safe percentage change - avoid division by zero
            self.df['YoY_Growth'] = self.df['Count'].pct_change(12).replace([np.inf, -np.inf], 0)
        
        if len(self.df) >= 7:
            self.df['Momentum_6'] = self.df['Count'] - self.df['Count'].shift(6)

        # Exponential moving averages
        self.df['EMA_3'] = self.df['Count'].ewm(span=3, adjust=False).mean().shift(1)
        if len(self.df) >= 12:
            self.df['EMA_12'] = self.df['Count'].ewm(span=12, adjust=False).mean().shift(1)

        # Seasonal decomposition (only if enough data)
        if len(self.df) >= 24:
            try:
                decomp = seasonal_decompose(self.df['Count'], model='additive', period=12)
                self.df['Trend'] = decomp.trend.shift(1)
                self.df['Seasonal'] = decomp.seasonal.shift(1)
                self.df['Residual'] = decomp.resid.shift(1)
            except Exception as e:
                logging.warning(f"Seasonal decomposition failed: {e}")
                self.df['Trend'] = np.nan
                self.df['Seasonal'] = np.nan
                self.df['Residual'] = np.nan
        else:
            logging.info("Insufficient data for seasonal decomposition, skipping")

        # Drop rows with NaN values
        initial_len = len(self.df)
        self.df.dropna(inplace=True)
        dropped = initial_len - len(self.df)
        
        # Replace any remaining inf values with 0
        self.df.replace([np.inf, -np.inf], 0, inplace=True)
        
        logging.info(f"Features engineered. Shape: {self.df.shape} (dropped {dropped} rows with NaN)")
        
        if len(self.df) < self.seq_length + 1:
            logging.warning(f"After feature engineering, only {len(self.df)} rows remain. "
                          f"Consider reducing seq_length or starting from an earlier year.")

    def prepare_data(self, univariate=False):
        """Prepare data with improved scaling and validation"""
        if len(self.df) < self.seq_length + 1:
            logging.warning(f"Insufficient data: {len(self.df)} entries")
            return None, None, None, None

        if univariate:
            feats = ['Count']
        else:
            feats = [col for col in self.df.columns 
                    if col not in ['Date', 'Month', 'Year', 'Quarter']]

        logging.info(f"Using {len(feats)} features")
        
        # Additional safety: check for inf/nan values
        data_subset = self.df[feats].copy()
        
        # Replace any inf values
        data_subset.replace([np.inf, -np.inf], np.nan, inplace=True)
        
        # Fill remaining NaN with forward fill, then backward fill, then 0
        data_subset = data_subset.ffill()
        data_subset = data_subset.bfill()
        data_subset.fillna(0, inplace=True)
        
        # Check for any remaining problematic values
        if data_subset.isnull().any().any():
            logging.error("Data still contains NaN values after cleaning")
            return None, None, None, None
        
        if np.isinf(data_subset.values).any():
            logging.error("Data still contains infinite values after cleaning")
            return None, None, None, None
        
        # Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        try:
            scaled_data = scaler.fit_transform(data_subset)
        except Exception as e:
            logging.error(f"Scaling failed: {e}")
            logging.error(f"Data summary:\n{data_subset.describe()}")
            return None, None, None, None

        X, y = [], []
        for i in range(len(scaled_data) - self.seq_length):
            X.append(scaled_data[i:i + self.seq_length])
            y.append(scaled_data[i + self.seq_length, 0])

        X = np.array(X)
        y = np.array(y)
        
        logging.info(f"Prepared {len(X)} sequences")
        return (torch.tensor(X, dtype=torch.float32), 
                torch.tensor(y, dtype=torch.float32), 
                scaler, feats)

    def train_models(self, X_uni, y_uni, X_multi, y_multi):
        """Train ensemble of advanced models"""
        if X_uni is None:
            return

        logging.info("Training advanced model ensemble...")

        # 1. Attention LSTM
        logging.info("Training Attention LSTM...")
        lstm_model = AttentionLSTM(input_size=1, hidden_size=64, num_layers=2)
        self.models['Attention_LSTM'], _ = train_dl_model(lstm_model, X_uni, y_uni, epochs=200)

        # 2. Transformer
        logging.info("Training Transformer...")
        trans_model = TransformerForecaster(input_size=1, d_model=64, nhead=4)
        self.models['Transformer'], _ = train_dl_model(trans_model, X_uni, y_uni, epochs=200)

        # 3. Deep MLP
        logging.info("Training Deep MLP...")
        mlp_model = DeepMLPForecaster(input_size=self.seq_length * 1, hidden_size=128)
        self.models['Deep_MLP'], _ = train_dl_model(mlp_model, X_uni, y_uni, epochs=200)

        # 4. Random Forest
        logging.info("Training Random Forest...")
        self.models['RandomForest'] = RandomForestRegressor(
            n_estimators=200, max_depth=10, min_samples_split=5, n_jobs=-1
        )
        X_rf = X_multi.reshape(X_multi.shape[0], -1).numpy()
        self.models['RandomForest'].fit(X_rf, y_multi.numpy())

        # 5. Gradient Boosting
        logging.info("Training Gradient Boosting...")
        self.models['GradientBoosting'] = GradientBoostingRegressor(
            n_estimators=200, max_depth=5, learning_rate=0.1, subsample=0.8
        )
        self.models['GradientBoosting'].fit(X_rf, y_multi.numpy())

        # 6. Extra Trees
        logging.info("Training Extra Trees...")
        self.models['ExtraTrees'] = ExtraTreesRegressor(
            n_estimators=200, max_depth=10, min_samples_split=5, n_jobs=-1
        )
        self.models['ExtraTrees'].fit(X_rf, y_multi.numpy())

        # 7. ARIMA with grid search
        logging.info("Training ARIMA...")
        self.models['ARIMA'] = self._fit_arima_grid(self.df['Count'])

        # 8. Exponential Smoothing
        if len(self.df) >= 24:
            logging.info("Training Exponential Smoothing...")
            try:
                self.models['ExpSmoothing'] = ExponentialSmoothing(
                    self.df['Count'], 
                    seasonal_periods=12,
                    trend='add',
                    seasonal='add'
                ).fit()
            except:
                logging.warning("Exponential Smoothing failed, skipping")

        logging.info(f"Trained {len(self.models)} models successfully")

    def _fit_arima_grid(self, series):
        """Grid search for optimal ARIMA parameters"""
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
            logging.warning("ARIMA grid search failed, using (1,1,1)")
            best_model = ARIMA(series, order=(1,1,1)).fit()
        else:
            logging.info(f"Best ARIMA order: {best_order}, AIC: {best_aic:.2f}")
        
        return best_model

    def evaluate_models(self, X_uni, y_uni, X_multi, y_multi, uni_feats, multi_feats, uni_scaler):
        """Comprehensive model evaluation with cross-validation"""
        if X_uni is None:
            return {}

        logging.info("Evaluating models with time series cross-validation...")
        tscv = TimeSeriesSplit(n_splits=5)
        results = {}

        for name, model in self.models.items():
            logging.info(f"Evaluating {name}...")
            scores = {'rmse': [], 'mae': [], 'r2': [], 'mape': []}
            
            for fold, (train_idx, val_idx) in enumerate(tscv.split(np.arange(len(self.df) - self.seq_length))):
                try:
                    y_val_actual = self.df['Count'].iloc[val_idx + self.seq_length].values
                    
                    if name == 'ARIMA':
                        series_train = self.df['Count'].iloc[0:train_idx[-1] + self.seq_length + 1]
                        fitted = self._fit_arima_grid(series_train)
                        pred = fitted.forecast(steps=len(val_idx))
                        pred = np.array(pred)
                    
                    elif name == 'ExpSmoothing':
                        series_train = self.df['Count'].iloc[0:train_idx[-1] + self.seq_length + 1]
                        fitted = ExponentialSmoothing(
                            series_train,
                            seasonal_periods=12,
                            trend='add',
                            seasonal='add'
                        ).fit()
                        pred = fitted.forecast(steps=len(val_idx))
                        pred = np.array(pred)
                    
                    elif isinstance(model, nn.Module):
                        # For neural networks, use simplified approach
                        model.eval()
                        X_val = X_uni[val_idx]
                        with torch.no_grad():
                            pred_scaled = model(X_val).squeeze().numpy()
                        
                        # Inverse transform
                        dummy = np.zeros((len(pred_scaled), uni_scaler.n_features_in_))
                        dummy[:, 0] = pred_scaled
                        pred = uni_scaler.inverse_transform(dummy)[:, 0]
                    
                    else:
                        # ML models
                        X_train = X_multi[train_idx].reshape(len(train_idx), -1).numpy()
                        X_val = X_multi[val_idx].reshape(len(val_idx), -1).numpy()
                        y_train = y_multi[train_idx].numpy()
                        
                        temp_model = type(model)(**model.get_params())
                        temp_model.fit(X_train, y_train)
                        pred_scaled = temp_model.predict(X_val)
                        
                        # Inverse transform
                        dummy = np.zeros((len(pred_scaled), uni_scaler.n_features_in_))
                        dummy[:, 0] = pred_scaled
                        pred = uni_scaler.inverse_transform(dummy)[:, 0]
                    
                    # Calculate metrics
                    pred = np.maximum(pred, 0)  # No negative predictions
                    scores['rmse'].append(np.sqrt(mean_squared_error(y_val_actual, pred)))
                    scores['mae'].append(mean_absolute_error(y_val_actual, pred))
                    scores['r2'].append(r2_score(y_val_actual, pred))
                    
                    # MAPE with handling for zero values
                    mape = np.mean(np.abs((y_val_actual - pred) / np.maximum(y_val_actual, 1))) * 100
                    scores['mape'].append(mape)
                
                except Exception as e:
                    logging.warning(f"Fold {fold} failed for {name}: {str(e)}")
                    continue
            
            if scores['rmse']:
                results[name] = {k: np.mean(v) for k, v in scores.items()}
                logging.info(f"{name} - RMSE: {results[name]['rmse']:.2f}, "
                           f"MAE: {results[name]['mae']:.2f}, "
                           f"R²: {results[name]['r2']:.3f}, "
                           f"MAPE: {results[name]['mape']:.2f}%")
        
        return results

    def predict(self, X_uni, uni_scaler, X_multi, multi_scaler):
        """Generate predictions from all models with simulated boom, volatility, and seasonality"""
        if X_uni is None:
            mean_count = self.df['Count'].mean()
            self.ensemble_preds = np.full(self.future_months, mean_count)
            logging.warning("Using simple mean forecast due to insufficient data")
            return

        logging.info("Generating predictions from all models...")
        
        last_seq_uni = torch.tensor(
            uni_scaler.transform(self.df[self.uni_feats].tail(self.seq_length)),
            dtype=torch.float32
        )
        
        # Calculate historical growth rate for bias - SAFE CALCULATION
        recent_data = self.df_full['Count'].tail(24) if len(self.df_full) >= 24 else self.df_full['Count']
        # Avoid division by zero or inf
        try:
            historical_growth_rate = recent_data.pct_change(12).replace([np.inf, -np.inf], np.nan).mean()
            if np.isnan(historical_growth_rate):
                historical_growth_rate = 0.05
        except:
            historical_growth_rate = 0.05
            
        # Force a "Boom" scenario as requested
        # Start with historical growth but accelerate it
        base_growth = max(historical_growth_rate, 0.10) # Minimum 10% base growth
        
        logging.info(f"Applying simulated boom scenario (Base growth: {base_growth*100:.1f}%)")
        
        for name, model in self.models.items():
            try:
                logging.info(f"Predicting with {name}...")
                
                if name == 'ARIMA':
                    preds = model.forecast(steps=self.future_months)
                    preds = np.array(preds)
                
                elif name == 'ExpSmoothing':
                    preds = model.forecast(steps=self.future_months)
                    preds = np.array(preds)
                
                elif isinstance(model, nn.Module):
                    preds = self._predict_future_dl(
                        model, last_seq_uni, uni_scaler, self.future_months
                    )
                
                else:
                    # ML models - simulate future predictions
                    preds = self._predict_future_ml(
                        model, X_multi, multi_scaler, self.future_months
                    )
                
                # --- APPLY SYNTHETIC FLUCTUATIONS (Boom, Volatility, Seasonality) ---
                
                # 1. Simulated Boom (Exponential Growth)
                # Scale up significantly over time
                for i in range(len(preds)):
                    months_ahead = i + 1
                    years_ahead = months_ahead / 12
                    
                    # Boom factor: accelerates over time
                    # Year 1: ~1.2x, Year 5: ~2.5x
                    boom_factor = (1 + base_growth) ** years_ahead
                    
                    # Add an extra "viral spike" component that kicks in after year 1
                    if years_ahead > 1:
                        viral_factor = 1.0 + (years_ahead - 1) * 0.2
                        boom_factor *= viral_factor
                        
                    preds[i] = preds[i] * boom_factor
                
                # 2. Strong Seasonality
                # Add a sine wave that grows with the magnitude of the data
                # Peak in summer (approx month 6-7)
                seasonal_amplitude = 0.3  # 30% swing
                seasonality = preds * seasonal_amplitude * np.sin(2 * np.pi * (np.arange(len(preds)) - 6) / 12)
                preds = preds + seasonality
                
                # 3. High Volatility (Random Noise)
                # Add random noise proportional to the value
                volatility_level = 0.25 # 25% random fluctuation
                noise = np.random.normal(0, volatility_level, len(preds)) * preds
                preds = preds + noise
                
                preds = np.maximum(preds, 0)  # No negative predictions
                
                self.model_predictions[name] = preds
                
            except Exception as e:
                logging.error(f"Prediction failed for {name}: {str(e)}")
        
        # Ensemble predictions
        if self.model_predictions:
            all_preds = np.array(list(self.model_predictions.values()))
            
            # Simple average for ensemble to capture all variations
            self.ensemble_preds = np.mean(all_preds, axis=0)
            
            # Ensure minimum values (don't let it drop back to 0 completely)
            # If we are booming, we shouldn't crash to zero
            min_floor = np.linspace(1, 5, len(self.ensemble_preds)) # Floor rises from 1 to 5
            self.ensemble_preds = np.maximum(self.ensemble_preds, min_floor)
            
            logging.info(f"Ensemble predictions generated: "
                        f"Mean={self.ensemble_preds.mean():.1f}, "
                        f"Std={self.ensemble_preds.std():.1f}, "
                        f"Growth={(self.ensemble_preds[-1] / max(self.ensemble_preds[0], 0.1) - 1) * 100:.1f}%")

    def _predict_future_dl(self, model, last_seq, scaler, steps):
        """Predict future values with deep learning model - with growth and volatility"""
        model.eval()
        preds = []
        current_seq = last_seq.unsqueeze(0)
        
        # Calculate base volatility from recent data
        recent_volatility = np.std(self.df_full['Count'].tail(12))
        
        for i in range(steps):
            with torch.no_grad():
                out = model(current_seq)
            pred = out.item()
            
            # Add increasing trend component
            trend_boost = 0.002 * i  # Increasing trend over time
            pred = pred * (1 + trend_boost)
            
            preds.append(pred)
            
            # Update sequence
            new_val = torch.tensor([[[pred]]], dtype=torch.float32)
            current_seq = torch.cat((current_seq[:, 1:, :], new_val), dim=1)
        
        # Inverse transform
        preds = np.array(preds).reshape(-1, 1)
        dummy = np.zeros((len(preds), scaler.n_features_in_))
        dummy[:, 0] = preds[:, 0]
        preds_inv = scaler.inverse_transform(dummy)[:, 0]
        
        return preds_inv

    def _predict_future_ml(self, model, X_multi, scaler, steps):
        """Predict future values with ML model - with growth and volatility"""
        last_features = X_multi[-1].reshape(1, -1).numpy()
        preds = []
        
        for i in range(steps):
            pred_scaled = model.predict(last_features)[0]
            
            # Add growth trend
            growth_factor = 1.0 + (0.003 * i)  # Compounding growth
            pred_scaled = pred_scaled * growth_factor
            
            preds.append(pred_scaled)
            
            # Update features with growth consideration
            last_features = np.roll(last_features, -1)
            last_features[0, -1] = pred_scaled
        
        # Inverse transform
        dummy = np.zeros((len(preds), scaler.n_features_in_))
        dummy[:, 0] = preds
        preds_inv = scaler.inverse_transform(dummy)[:, 0]
        
        return preds_inv

    def plot_and_export(self, metrics=None):
        """Generate all visualizations and export results"""
        if self.df is None:
            return

        logging.info("Generating visualizations...")
        
        # Use full historical data for visualization (before feature engineering dropped rows)
        df_for_plot = self.df_full if self.df_full is not None else self.df
        
        # Beautiful static plots
        create_beautiful_static_plots(
            df_for_plot, self.ensemble_preds, self.parameter, 
            self.future_months
        )
        
        # Interactive dashboard
        create_interactive_dashboard(
            df_for_plot, self.ensemble_preds, self.parameter,
            self.future_months, self.model_predictions, metrics
        )
        
        # Export data
        logging.info("Exporting data...")
        df_for_plot.to_csv(f"{self.parameter}_historical_data.csv", index=False)
        
        if self.ensemble_preds is not None:
            future_dates = pd.date_range(
                start=df_for_plot['Date'].iloc[-1] + pd.DateOffset(months=1),
                periods=self.future_months,
                freq='MS'
            )
            pred_df = pd.DataFrame({
                'Date': future_dates,
                'Ensemble_Prediction': self.ensemble_preds
            })
            
            # Add individual model predictions
            for name, preds in self.model_predictions.items():
                pred_df[f'{name}_Prediction'] = preds
            
            pred_df.to_csv(f"{self.parameter}_predictions.csv", index=False)
        
        # Export metrics
        if metrics:
            metrics_df = pd.DataFrame(metrics).T
            metrics_df.to_csv(f"{self.parameter}_model_metrics.csv")
            
            logging.info("\n" + "="*60)
            logging.info("MODEL PERFORMANCE SUMMARY")
            logging.info("="*60)
            logging.info(metrics_df.to_string())
            logging.info("="*60)
        
        # Feature importance for tree-based models
        if 'RandomForest' in self.models and self.features:
            logging.info("\n" + "="*60)
            logging.info("FEATURE IMPORTANCE (Random Forest)")
            logging.info("="*60)
            
            try:
                importances = self.models['RandomForest'].feature_importances_
                
                # RandomForest was trained on flattened sequences (seq_length * num_features)
                # So we need to aggregate importance across time steps
                num_base_features = len(self.features)
                
                # Reshape importances if needed
                if len(importances) == num_base_features * self.seq_length:
                    # Aggregate importance across time steps for each feature
                    aggregated_importance = np.zeros(num_base_features)
                    for i in range(num_base_features):
                        # Sum importance across all time steps for this feature
                        feature_importance_across_time = importances[i::num_base_features]
                        aggregated_importance[i] = np.sum(feature_importance_across_time)
                    
                    feature_importance = pd.DataFrame({
                        'Feature': self.features,
                        'Importance': aggregated_importance
                    }).sort_values('Importance', ascending=False)
                else:
                    # If dimensions don't match expected, just show top features by raw importance
                    top_n = min(20, len(importances))
                    feature_importance = pd.DataFrame({
                        'Feature_Index': range(len(importances)),
                        'Importance': importances
                    }).sort_values('Importance', ascending=False).head(top_n)
                
                logging.info(feature_importance.to_string())
                feature_importance.to_csv(f"{self.parameter}_rf_feature_importance.csv", index=False)
            except Exception as e:
                logging.warning(f"Could not compute feature importance: {e}")
            
            logging.info("="*60)
        
        if 'GradientBoosting' in self.models and self.features:
            logging.info("\n" + "="*60)
            logging.info("FEATURE IMPORTANCE (Gradient Boosting)")
            logging.info("="*60)
            
            try:
                importances = self.models['GradientBoosting'].feature_importances_
                num_base_features = len(self.features)
                
                if len(importances) == num_base_features * self.seq_length:
                    aggregated_importance = np.zeros(num_base_features)
                    for i in range(num_base_features):
                        feature_importance_across_time = importances[i::num_base_features]
                        aggregated_importance[i] = np.sum(feature_importance_across_time)
                    
                    feature_importance = pd.DataFrame({
                        'Feature': self.features,
                        'Importance': aggregated_importance
                    }).sort_values('Importance', ascending=False)
                else:
                    top_n = min(20, len(importances))
                    feature_importance = pd.DataFrame({
                        'Feature_Index': range(len(importances)),
                        'Importance': importances
                    }).sort_values('Importance', ascending=False).head(top_n)
                
                logging.info(feature_importance.to_string())
                feature_importance.to_csv(f"{self.parameter}_gb_feature_importance.csv", index=False)
            except Exception as e:
                logging.warning(f"Could not compute feature importance: {e}")
            
            logging.info("="*60)

    def generate_report(self, metrics=None):
        """Generate a comprehensive HTML report"""
        logging.info("Generating comprehensive report...")
        
        # Use full data for reporting
        df_for_report = self.df_full if self.df_full is not None else self.df
        
        report_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Publication Forecast Report - {self.parameter}</title>
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }}
                .container {{
                    background: white;
                    border-radius: 15px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }}
                h1 {{
                    color: #2c3e50;
                    border-bottom: 4px solid #3498db;
                    padding-bottom: 15px;
                    font-size: 2.5em;
                }}
                h2 {{
                    color: #34495e;
                    margin-top: 30px;
                    font-size: 1.8em;
                }}
                .summary-box {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    margin: 20px 0;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }}
                .metric {{
                    display: inline-block;
                    margin: 10px 20px;
                    font-size: 1.2em;
                }}
                .metric-value {{
                    font-size: 2em;
                    font-weight: bold;
                    display: block;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                th {{
                    background: #3498db;
                    color: white;
                    padding: 15px;
                    text-align: left;
                }}
                td {{
                    padding: 12px 15px;
                    border-bottom: 1px solid #ecf0f1;
                }}
                tr:hover {{
                    background: #f8f9fa;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #ecf0f1;
                    color: #7f8c8d;
                }}
                .chart-container {{
                    margin: 30px 0;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 PubMed Publication Forecast Report</h1>
                <h2>Parameter: {self.parameter}</h2>
                
                <div class="summary-box">
                    <div class="metric">
                        <span>Historical Data Points</span>
                        <span class="metric-value">{len(df_for_report)}</span>
                    </div>
                    <div class="metric">
                        <span>Date Range</span>
                        <span class="metric-value">{df_for_report['Date'].min().strftime('%Y-%m')} to {df_for_report['Date'].max().strftime('%Y-%m')}</span>
                    </div>
                    <div class="metric">
                        <span>Forecast Horizon</span>
                        <span class="metric-value">{self.future_months} months</span>
                    </div>
                    <div class="metric">
                        <span>Models Trained</span>
                        <span class="metric-value">{len(self.models)}</span>
                    </div>
                </div>
                
                <h2>📈 Key Statistics</h2>
                <table>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Total Historical Publications</td>
                        <td>{df_for_report['Count'].sum():,}</td>
                    </tr>
                    <tr>
                        <td>Average Monthly Publications</td>
                        <td>{df_for_report['Count'].mean():.1f}</td>
                    </tr>
                    <tr>
                        <td>Peak Month</td>
                        <td>{df_for_report.loc[df_for_report['Count'].idxmax(), 'Date'].strftime('%Y-%m')} 
                            ({df_for_report['Count'].max():,} publications)</td>
                    </tr>
                    <tr>
                        <td>Predicted Average (Next {self.future_months} months)</td>
                        <td>{self.ensemble_preds.mean():.1f}</td>
                    </tr>
                </table>
        """
        
        if metrics:
            report_html += """
                <h2>🎯 Model Performance</h2>
                <table>
                    <tr>
                        <th>Model</th>
                        <th>RMSE</th>
                        <th>MAE</th>
                        <th>R²</th>
                        <th>MAPE (%)</th>
                    </tr>
            """
            for model_name, model_metrics in metrics.items():
                report_html += f"""
                    <tr>
                        <td><strong>{model_name}</strong></td>
                        <td>{model_metrics['rmse']:.2f}</td>
                        <td>{model_metrics['mae']:.2f}</td>
                        <td>{model_metrics['r2']:.3f}</td>
                        <td>{model_metrics.get('mape', 0):.2f}</td>
                    </tr>
                """
            report_html += "</table>"
        
        report_html += f"""
                <h2>📁 Generated Files</h2>
                <ul>
                    <li><strong>{self.parameter}_comprehensive_analysis.png</strong> - Static visualization</li>
                    <li><strong>{self.parameter}_interactive_dashboard.html</strong> - Interactive dashboard</li>
                    <li><strong>{self.parameter}_historical_data.csv</strong> - Historical data</li>
                    <li><strong>{self.parameter}_predictions.csv</strong> - Forecast predictions</li>
                    <li><strong>{self.parameter}_model_metrics.csv</strong> - Model performance</li>
                </ul>
                
                <div class="footer">
                    <p>Report generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p>Advanced PubMed Forecasting System v2.0</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        with open(f"{self.parameter}_report.html", 'w') as f:
            f.write(report_html)
        
        logging.info(f"Comprehensive report saved: {self.parameter}_report.html")


def main():
    """Main execution function"""
    print("="*70)
    print("🚀 ADVANCED PUBMED PUBLICATION FORECASTING SYSTEM v2.0")
    print("="*70)
    print()
    
    # Get user inputs
    parameters_input = input("Enter parameters (comma-separated) [BPC-157]: ").strip() or "BPC-157"
    parameters = [p.strip() for p in parameters_input.split(',')]
    
    filter_str = input("Enter filter string (e.g., 'AND review[ptyp]') [None]: ").strip()
    
    start_year = int(input("Start year [2000]: ").strip() or 2000)
    seq_length = int(input("Sequence length [12]: ").strip() or 12)
    future_months = int(input("Future months to predict [60]: ").strip() or 60)
    
    print()
    print("="*70)
    print()
    
    for parameter in parameters:
        print(f"\n{'='*70}")
        print(f"Processing: {parameter}")
        print(f"{'='*70}\n")
        
        try:
            forecaster = PubMedForecaster(
                parameter=parameter,
                filter_str=filter_str,
                start_year=start_year,
                seq_length=seq_length,
                future_months=future_months
            )
            
            # Execute pipeline
            cache_file = f"{parameter}_raw_data.csv"
            forecaster.fetch_data(cache_file)
            forecaster.add_features()
            
            # Prepare data
            X_uni, y_uni, uni_scaler, uni_feats = forecaster.prepare_data(univariate=True)
            X_multi, y_multi, multi_scaler, multi_feats = forecaster.prepare_data(univariate=False)
            
            forecaster.features = multi_feats
            forecaster.uni_feats = uni_feats
            
            # Train and evaluate
            forecaster.train_models(X_uni, y_uni, X_multi, y_multi)
            metrics = forecaster.evaluate_models(
                X_uni, y_uni, X_multi, y_multi,
                uni_feats, multi_feats, uni_scaler
            )
            
            # Predict and visualize
            forecaster.predict(X_uni, uni_scaler, X_multi, multi_scaler)
            forecaster.plot_and_export(metrics)
            forecaster.generate_report(metrics)
            
            print(f"\n✅ Successfully completed analysis for {parameter}")
            print(f"📊 Check the generated files for results\n")
            
        except Exception as e:
            logging.error(f"Failed to process {parameter}: {str(e)}", exc_info=True)
            print(f"\n❌ Error processing {parameter}: {str(e)}\n")
    
    print("\n" + "="*70)
    print("🎉 ALL ANALYSES COMPLETE!")
    print("="*70)


if __name__ == "__main__":
    main()