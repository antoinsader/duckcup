
# ThreadMind project


## Introduction

Threadmind is a full-stack application used for email and telegram messages fetching and analysis, build with Python backend (FastAPI) and React frontend.

The backend provides API services for authentication, email/telegram emails and messages fetching, dataset management, and nlp services.
The frontend provides the user interface for interacting with the system.

The project can be run in two ways:

- Using Docker (recommended) – fastest way to run the entire system
- Running backend and frontend independently – useful for development

## What you can do inside the application:

- Connect to multiple gmail accounts
- Connect to multiple telegram accounts
- Discover emails/messages with filters.
- Save selected emails/messages as your datasets
- Perform NLP services on your datasets like clustering, summarization,...

Instructions for using the application are available in:
[User guide](https://github.com/antoinsader/threadmind/blob/publish/frontend/user_guide.md)

## Quick Start (Recommended: Docker)

The easiest way to run the project is using Docker.
1. Install Docker:

Install Docker and Docker Compose:
https://docs.docker.com/get-docker/

2. Clone the repository
```
git clone https://github.com/antoinsader/threadmind.git
cd threadmind
```

3. Configure backend environment

Create the backend environment configuration:

```
    cp backend/.env.example backend/.env
```

**Edit the file with your own environment variables.**
see how in [backend/readme.md#environment-variables](https://github.com/antoinsader/threadmind/tree/publish/backend#environment-variables) 

4. Start the application
Run:
```
docker compose up --build
```

Docker will:
- build the backend container
- build the frontend container
- install all dependencies
- start both services

5. Access the application

Frontend:
```
http://localhost:3000
```

Backend API:
```
http://localhost:8000
```

## Running Without Docker (Development Mode)

If you prefer to run the services independently for development, follow the instructions in the respective folders.

### Backend setup:
- Setup python environment
- Download requirements using ```backend/requirements.txt```
- Create ```.env``` file from ```.env.example```
- Run the server using ```python main.py```

You have to set your own environment variables to make the back-end run, see how in [backend/readme.md#environment-variables](https://github.com/antoinsader/threadmind/tree/publish/backend#environment-variables) 



### Frontend setup

- Make sure node is installed
- Download dependencies using ``` npm install ```
- Run the application using ``` npm run start ```


This document explains how users can use the application different services.

## API Documentation:
The backend API endpoints are documented in static .md file:
[endpoints.md](https://github.com/antoinsader/threadmind/blob/publish/backend/endpoints.md)

This file describes all the available api endpoints.
Interactive docs are available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the server is running.


## Technology Stack

### Backend:
- Language: Python
- For api: FastAPI, Uvicorn
- For NLP: Spacy, numpy, torch, sentence transformers, scikit-learn, keybert, ollama, huggingface_hub, faiss
- for Emails: imapclient, bs4
- For telegram: telethon
- For database: SQLLite
- For encryption:  sqlalchemy, cryptography

### Frontend:
- React
- Node.js

### Infrastructure:
- Docker
- Docker Compose


## License

This project is licensed under the MIT License.
See the LICENSE file for details.