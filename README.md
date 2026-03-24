# Flight Dashboard

Full-stack microservices application for flight search and AI-powered price prediction. Built with React, Node.js, Python Flask, deployed on Kubernetes.

## Features

- **Flight Search** – Search flights by departure, arrival, airline, and date range.
- **AI Price Prediction** – Hybrid model with 85-98% confidence (rule-based + GPT-3.5)
- **Popular Routes Tracking** – Records and ranks frequently searched routes.
- **User Accounts** – Secure login with Redis sessions.
- **Flight Reviews** – Users can leave comments and ratings for flights.
- **Autocomplete Search** – Airport search with instant suggestions.
- **Responsive Design** – Works on desktop, tablet, and mobile.

## Tech Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express, MySQL, Redis
- **ML Service:** Python, Flask, OpenAI GPT-3.5  
- **DevOps:** Docker, Kubernetes, Nginx

## Project Structure
```
flight-dashboard/
├── client/               # React frontend
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── server/              # Node.js backend
│   ├── routes/
│   ├── database/
│   └── middleware/
├── ml-service/          # Python ML service
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── k8s/                 # Kubernetes manifests
│   ├── *.yaml
│   └── secret.yaml      # Template only
├── docker-compose.yml
└── README.md
```

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yvonneyihan/flight-dashboard.git
   cd flight-dashboard

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd ml-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..

3. **Database setup**
   Create a MySQL database.
   The database name is customizable. Replace skylink with your own name everywhere (in SQL and .env)
   Run the schema and sample data:
   ```bash
   mysql -u root -p -e "CREATE DATABASE skylink;"
   mysql -u root -p skylink < server/database/schema.sql
   mysql -u root -p skylink < server/database/sample_data.sql

5. **Start backend + frontend**
   ```bash
   npm run dev

6. **Start ML Service**
   ```bash
   cd ml-service
   source venv/bin/activate
   python app.py

7. **Open the app at http://localhost:5173**

## Deploy to Kubernetes

1. **Clone the repository**
   ```bash
   git clone https://github.com/yvonneyihan/flight-dashboard.git
   cd flight-dashboard

2. **Build Docker images**
   ```bash
   docker build -t flight-frontend:latest ./client
   docker build -t flight-backend:latest .
   docker build -t flight-ml-service:latest ./ml-service

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml

4. **Create secrets (don't commit!)**
   ```bash
   kubectl create secret generic flight-secrets -n flight-dashboard \
     --from-literal=DB_PASSWORD='your_password' \
     --from-literal=OPENAI_API_KEY='your_key' \
     --from-literal=SESSION_SECRET='random_secret'

5. **Deploy services**
   ```bash
   kubectl apply -f k8s/mysql-pvc.yaml
   kubectl apply -f k8s/mysql-init.yaml
   kubectl apply -f k8s/mysql.yaml
   kubectl apply -f k8s/redis.yaml
   kubectl apply -f k8s/ml-service.yaml
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/frontend.yaml

4. **Wait for pods to be ready**
   ```bash
   kubectl get pods -n flight-dashboard -w

5. **Access application**
   ```bash
   kubectl port-forward -n flight-dashboard svc/frontend 8080:80
   
6. **Open at http://localhost:8080**
