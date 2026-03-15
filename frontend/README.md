# ThreadMind Frontend

ThreadMind Frontend is a React application for connecting emails and telegram accounts, browsing content, creating datasets, and running NLP workflows on those datasets.

## Backend Requirement

This frontend requires the ThreadMind backend to be running.

- Backend repository: `BACKEND_REPO_LINK`
- Start the backend first, then run this frontend.

## Main Features

- Authentication with protected routes.
- Multi-account integration for Gmail and Telegram.
- Rich email and message exploration with filtering and search.
- Dataset creation from filtered emails or Telegram messages.
- Dataset analysis tools:
	- Important keywords and n-grams extraction.
	- Clustering of all dataset messages.
	- Clustering by sender.
	- AI-generated cluster titles.
	- Cluster and selected-group summarization.
- Global command palette for fast navigation and actions.
- Tab-based workspace with reorder and tab management.
- API key management for analysis providers.
- Designed and implemented a modular, maintainable backend architecture to support complex NLP workflows and large datasets efficiently.
- Separated concerns across service layers (data ingestion, processing, storage, API endpoints).
- Built for scalability and easy extension to new data sources or NLP pipelines.


## Try With Public Datasets

You can try the application even before connecting your own accounts by using the public datasets.

1. Register with a username and password.
2. Open the datasets page in the app.
3. Explore the same analysis workflows available for saved datasets, including:
	- Clustering messages.
	- Extracting keywords.
	- Summarizing content.

## Frontend Architecture (Overview)

The project follows a modular Create React App structure:

- `src/Pages`: Route-level screens (Home, Emails, Datasets, Telegram, Accounts, etc.).
- `src/components`: Reusable UI and layout components (`reusable`, `layout_shell`, `page_components`).
- `src/lib/backend`: API service modules grouped by domain (`emails`, `dataset`, `account`, etc.).
- `src/lib/api/api.js`: Shared request helper with centralized API error handling.
- `src/lib/contexts`: Global state via React Context (`AuthContext`, `CacheContext`, `CommandContext`, `UserContext`).
- `src/lib/router`: Route and protected route setup.
- `src/styles`: Global styles, SCSS variables, and mixins.

This separation keeps domain logic, UI composition, and shared infrastructure easy to maintain as features grow.

## User Guide

- In-app route: `/user-guide`
- Markdown guide in repository: [`user_guide.md`](./user_guide.md)

Note: `user_guide.md` is copied into `public/user_guide.md` automatically before `start` and `build` through project scripts.

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the frontend

```bash
npm run start
```

By default, the app runs at `http://localhost:3000`.

## Other Scripts

- `npm test`: Start the test runner in watch mode.
- `npm run build`: Create a production build in `build/`.
