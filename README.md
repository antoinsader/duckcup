
# ThreadMind project


## Introduction

Threadmind is a full-stack application used for email and telegram messages fetching and analysis, build with Python backend (FastAPI) and React frontend.

The backend provides API services for authentication, email/telegram emails and messages fetching, dataset management, and nlp services.
The frontend provides the user interface for interacting with the system.

The project can be run in two ways:

1- Using Docker (recommended) – fastest way to run the entire system
2- Running backend and frontend independently – useful for development

## What you can do inside the application:

- Connect to multiple gmail accounts
- Connect to multiple telegram accounts
- Discover emails/messages with filters.
- Save selected emails/messages as your datasets
- Perform NLP services on your datasets like clustering, summarization,...

## Quick Start (Recommended: Docker)

The easiest way to run the project is using Docker.
1. Install Docker:

Install Docker and Docker Compose:
https://docs.docker.com/get-docker/

2. Clone the repository
```
git clone <repository-url>
cd <repository-folder>
```

3. Configure backend environment

Create the backend environment configuration:

```
    cp backend/.env.example backend/.env
```

Edit the file if needed and generate the required secrets.
Detailed instructions are available in:
backend/README.md


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

### Frontend setup

- Make sure node is installed
- Download dependencies using ``` npm install ```
- Run the application using ``` npm run start ```


## User Guide:
Instructions for using the application are available in:

```
    frontend/user_guide.md
```

This document explains how users can use the application different services.

## API Documentation:
The backend API endpoints are documented in:
backend/endpoints.md

This file describes all the available api endpoints.

Or you can explore http://localhost:8000/docs while the api server is running

## Environment Variables

The backend requires several environment variables to run.
An example configuration file is provided:
backend/.env.example

You can refer to backend/readme.md to see how to setup the variables.

## Technology Stack

Backend:
- Language: Python
- Libraries for api: FastAPI, Uvicorn
- Libararies for NLP: Spacy, numpy, torch, sentence transformers, scikit-learn, ollama
- Libraries for connecting to Emails: imapclient
- Libraries for connecting to telegram: telethon


SQLite

Frontend:

React

Node.js

Infrastructure:

Docker

Docker Compose
