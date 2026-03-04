# SCRAI - Supply Chain Risk AI Intelligence Platform

An AI-powered supply chain risk intelligence platform that aggregates and analyzes real-time data from multiple sources to provide actionable insights for supply chain management.

## Overview

SCRAI combines data from GDELT (global events), NOAA (weather and climate), and World Bank (economic indicators) to deliver comprehensive risk assessments for supply chain operations. The platform uses AI to identify patterns, predict disruptions, and recommend mitigation strategies.

## Features

- **Real-time Data Collection**: Automated data gathering from GDELT, NOAA, and World Bank APIs
- **AI-Powered Analysis**: Intelligent risk assessment and pattern recognition
- **Interactive Dashboard**: Visualize supply chain risks and trends
- **Predictive Insights**: Forecast potential disruptions before they occur
- **Custom Alerts**: Configurable notifications for critical events

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Supabase**: Database and authentication
- **APScheduler**: Automated data collection scheduling
- **Pandas/NumPy**: Data processing and analysis

### Frontend
- **React**: Modern UI framework
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Vite**: Fast build tooling

## Project Structure

```
scrai/
├── backend/
│   ├── api/              # FastAPI routes and endpoints
│   ├── data/
│   │   ├── collectors/   # Data collection from external APIs
│   │   └── processors/   # Data transformation and cleaning
│   ├── models/           # Database models and schemas
│   └── scheduler/        # Automated task scheduling
├── frontend/
│   └── src/
│       ├── components/   # Reusable React components
│       ├── pages/        # Page-level components
│       └── hooks/        # Custom React hooks
└── .env.example          # Environment variables template
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account
- API keys for GDELT, NOAA, and World Bank

### Backend Setup

1. Create a Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp ../.env.example ../.env
# Edit .env with your actual API keys
```

4. Run the backend server:
```bash
uvicorn api.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue on GitHub.
