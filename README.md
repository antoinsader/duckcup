
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

Instructions for using the application are available in wiki:
[Wiki User guide](https://github.com/antoinsader/threadmind/wiki/user_guide)

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

3. Configure Docker Compose

Copy the example file:
```
cp docker-compose.example.yml docker-compose.yml
```

Open `docker-compose.yml` and fill in your Google OAuth credentials:
```
- GOOGLE_CLIENT_ID=your_google_client_id_here
- GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

See how to obtain these in [backend/README.md#setup-google-for-gmail-connection](https://github.com/antoinsader/threadmind/tree/publish/backend#setup-google-for-gmail-connection)

> All other secrets (`JWT_SECRET_KEY`, `SPECIAL_PASSWORD`, `BACKEND_SECRETS_ENCRYPTION_KEY`) are **generated automatically** on the first run and saved to `./data/.secrets`. You do not need to set them manually.
> both **./data** and **.docker-compose.yml** are in .gitignore.

4. Start the application
```
docker compose up --build
```

Docker will:
- build the backend and frontend containers
- install all dependencies
- generate secrets automatically on first run
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


## Future plans:

- Make access to gmail easier than creating a developer app..., Maybe using Gmail APP password
- Refactor front-end to have better ui/ux
- Add other AI services 
- Make agents mode so user can choose what to do with their messages/emails and with doing periodically option
- Make telegram bot to connect to the app
- Make a cli interface for the application
- Creating a wiki



## License

This project is licensed under the MIT License.
See the LICENSE file for details.