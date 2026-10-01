<img width="1618" height="935" alt="Screenshot 2026-10-01 at 1 54 53 PM" src="https://github.com/user-attachments/assets/7d95f624-4785-468a-8b38-7f7fc5e680a3" />
# Agentic Engineering Platform — UI

Next.js frontend for an AI-powered agentic software engineering platform.

The UI provides an execution dashboard for planning, executing, monitoring, validating, and reviewing software-engineering workflows performed by specialized AI agents.

The platform is designed to demonstrate an agentic software development lifecycle where a requirement can be transformed into dependency-aware engineering tasks, executed by specialized agents, validated through compilation and automated tests, assessed for engineering risks, and presented with an auditable execution history.

## Features

* Requirement-driven engineering workflow execution
* Run creation and execution monitoring
* Dependency-aware task visualization
* Specialized agent execution tracking
* Real-time workflow state updates using Server-Sent Events (SSE)
* Task status and execution timeline
* Agent attempts and execution details
* Engineering evidence and validation results
* Governance and audit trail
* Risk assessment visibility
* Engineering summary
* Run-level success/failure status
* API integration with the Spring Boot backend

## Architecture

The UI is intentionally maintained as a separate repository from the backend.

```text
                         ┌──────────────────────────┐
                         │        Browser           │
                         │                          │
                         │      localhost:3002      │
                         └────────────┬─────────────┘
                                      │
                                      │ HTTP / SSE
                                      ▼
                         ┌──────────────────────────┐
                         │       Next.js UI         │
                         │                          │
                         │      Port: 3002          │
                         └────────────┬─────────────┘
                                      │
                                      │ REST API / SSE
                                      ▼
                         ┌──────────────────────────┐
                         │     Spring Boot API      │
                         │                          │
                         │      Port: 8088          │
                         └────────────┬─────────────┘
                                      │
                                      │ Spring AI
                                      ▼
                         ┌──────────────────────────┐
                         │       Ollama             │
                         │                          │
                         │      Port: 11434         │
                         │                          │
                         │   qwen2.5-coder:7b       │
                         └──────────────────────────┘
```

## Why port 3002?

The frontend runs on **port 3002** because the Spring Boot backend's CORS configuration allows requests from:

```text
http://localhost:3002
```

Therefore, the application should be started on port `3002` during local development.

The frontend API configuration points to:

```text
http://localhost:8088
```

## Technology Stack

* Next.js 16
* React 19
* TypeScript
* TanStack Query
* Server-Sent Events (SSE)
* CSS Modules
* Native browser Fetch API

## Prerequisites

Install the following before starting the UI:

* Node.js 22 or later
* npm
* Running Agentic Engineering Platform backend

The backend repository is:

```text
agentic-engineering-platform
```

The backend must be available at:

```text
http://localhost:8088
```

The backend in turn uses a locally running Ollama instance.

## Configuration

Create `.env.local` in the root of the UI project:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8088
```

`.env.local` is intentionally excluded from Git.

## Installation

Clone the repository:

```bash
git clone https://github.com/crownhooves/agentic-engineering-platform-ui.git
cd agentic-engineering-platform-ui
```

Install dependencies:

```bash
npm install
```

## Run locally

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3002
```

## Backend

The UI requires the Agentic Engineering Platform backend to be running.

Clone the backend repository separately:

```bash
git clone https://github.com/crownhooves/agentic-engineering-platform.git
```

Start the backend using the Ollama profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=ollama
```

The backend runs on:

```text
http://localhost:8088
```

## Ollama

The backend uses a locally running Ollama instance.

Install Ollama and make sure the required model is available:

```bash
ollama pull qwen2.5-coder:7b
```

Verify:

```bash
ollama list
```

The backend expects Ollama at:

```text
http://localhost:11434
```

The UI does not communicate directly with Ollama. All AI requests flow through the Spring Boot backend.

## Production build

Build the Next.js application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The production server listens on port `3000` by default inside the container.

For the Docker configuration included in this repository, port `3000` is exposed by the container and mapped to host port `3002`.

## Docker

Build the image:

```bash
docker build -t agentic-engineering-platform-ui .
```

Run the container:

```bash
docker run --rm \
  --name agentic-frontend \
  -p 3002:3000 \
  agentic-engineering-platform-ui
```

The UI is then available at:

```text
http://localhost:3002
```

The backend remains independently deployable.

## Development Flow

A typical local development environment is:

```text
Terminal 1
──────────
Ollama
localhost:11434
        │
        ▼

Terminal 2
──────────
Spring Boot
localhost:8088
        │
        ▼

Terminal 3
──────────
Next.js
localhost:3002
        │
        ▼

Browser
localhost:3002
```

## Example Workflow

The UI can be used to submit a requirement such as:

```text
Build a scalable URL shortener service with REST APIs,
persistence, and analytics.
```

The agentic backend then coordinates specialized engineering tasks such as:

```text
Requirement
     │
     ▼
Requirement Analysis
     │
     ▼
Architecture
     │
     ├───────────────┐
     ▼               ▼
Core Implementation  Analytics
     │               │
     ├───────────────┤
     ▼
Unit Tests / Integration Tests
     │
     ▼
Build & Test Validation
     │
     ▼
Risk Assessment
     │
     ▼
Engineering Summary
     │
     ▼
Completed Run
```

The UI exposes the resulting execution state and task timeline.

## Engineering Governance

The dashboard provides visibility into:

* Run state transitions
* Task dependencies
* Agent execution
* Agent attempts and retries
* Validation results
* Risk assessment
* Engineering evidence
* Audit events
* Human approval/review states

This provides a traceable view of how an AI-assisted engineering workflow reached its final result.

## Repository Structure

```text
.
├── components/
│   └── UI components
├── hooks/
│   └── React hooks
├── lib/
│   └── API and client-side utilities
├── pages/
│   ├── index.tsx
│   └── runs/
│       └── Run dashboard pages
├── styles/
│   ├── components.module.css
│   ├── dashboard.module.css
│   └── globals.css
├── Dockerfile
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Related Repository

Backend:

```text
https://github.com/crownhooves/agentic-engineering-platform
```

## Notes

* Ollama runs locally and is not part of the UI container.
* The UI does not require direct access to Ollama.
* The backend is responsible for AI model communication.
* Port `3002` is intentional because it matches the backend CORS configuration.
* Local environment files and generated Next.js files are excluded from source control.

## Status

This repository represents the frontend of an end-to-end agentic engineering platform prototype with:

* AI-driven engineering workflows
* Specialized engineering agents
* Dependency-aware orchestration
* Parallel task execution
* Automated validation
* Risk assessment
* Governance and audit visibility
* Real-time execution monitoring

  <img width="1618" height="935" alt="Screenshot 2026-10-01 at 1 54 53 PM" src="https://github.com/user-attachments/assets/2f8501e0-acfe-4fdc-8173-3baab0c2de35" />
  <img width="1624" height="944" alt="Screenshot 2026-10-01 at 1 35 41 PM" src="https://github.com/user-attachments/assets/5b339f7e-eee2-4140-b2bd-abe1cfafb9bc" />

  <img width="1569" height="902" alt="Screenshot 2026-10-01 at 1 55 48 PM" src="https://github.com/user-attachments/assets/b5e72f74-56b5-4766-ad3c-06f179af8106" />

  <img width="1647" height="939" alt="Screenshot 2026-10-01 at 1 56 05 PM" src="https://github.com/user-attachments/assets/c6033b94-3039-40e3-b2af-453491b7fca0" />

  




