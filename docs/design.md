# Technical Design Document
## AusBiz Fitness Center — Digital Twin

---

## Overview

This document describes the technical design of the AusBiz Fitness Center digital twin. It is generated from the Product Requirements Document (PRD) and serves as the implementation blueprint for the development team.

---

## System Architecture

```
User (Browser)
     │
     ▼
Next.js 15 Frontend (Chat UI)
     │
     ▼
Server Action (API Layer)
     │
     ├──► Upstash Vector DB
     │         │
     │         ▼
     │    Similarity Search
     │    (Top 5 relevant chunks)
     │
     ▼
Groq Cloud LLM (llama-3.1-8b-instant)
     │
     ▼
AI Response → Displayed in Chat UI
```

---

## Components

### 1. Chat UI (Frontend)
- Built with Next.js 15 and TypeScript
- Styled with Tailwind CSS
- Single page chat interface
- User types a question → sends to server action
- Displays AI response in real time
- Responsive on desktop and mobile

### 2. Server Action (API Layer)
- Handles incoming user questions
- Calls Upstash Vector to retrieve relevant gym data
- Passes retrieved context + question to Groq LLM
- Returns AI response to the frontend

### 3. Upstash Vector Database
- Stores gym knowledge base as vector embeddings
- Embedding model: BGE_SMALL_EN_V1_5
- Index name: AusBizFitnessCenter
- Query method: `index.query({ data: question, topK: 5, includeMetadata: true })`
- Minimum 45 vectors required

### 4. Groq Cloud LLM
- Model: llama-3.1-8b-instant
- Used for generating natural language responses
- System prompt restricts answers to AusBiz Fitness Center topics only
- Client instantiated directly inside server action

### 5. Knowledge Base Data
- Stored in `/data` folder as JSON or text files
- Contains gym information:
  - Membership plans and pricing
  - Operating hours
  - Fitness classes and schedules
  - Equipment and facilities
  - Gym policies and FAQs

---

## Data Flow

1. User types a question in the chat UI
2. Question is sent to the server action
3. Server action queries Upstash Vector with the question
4. Top 5 most relevant chunks are retrieved
5. Chunks + question are sent to Groq LLM as context
6. LLM generates a response grounded in the retrieved data
7. Response is returned and displayed in the chat UI

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `UPSTASH_VECTOR_REST_URL` | Upstash Vector database URL |
| `UPSTASH_VECTOR_REST_TOKEN` | Upstash Vector auth token |
| `GROQ_API_KEY` | Groq Cloud API key |

---

## File Structure

```
/
├── app/
│   ├── page.tsx              # Main chat UI page
│   ├── layout.tsx            # Root layout
│   └── actions.ts            # Server actions (API calls)
├── lib/
│   ├── upstash.ts            # Upstash Vector client
│   └── groq.ts               # Groq client
├── data/
│   └── ausbiz-gym-data.json  # Gym knowledge base
├── docs/
│   ├── prd.md                # Product Requirements
│   ├── design.md             # This file
│   └── test-plan.md          # QA Test Plan
├── agents.md                 # AI agent instructions
└── README.md                 # Project overview
```

---

## System Prompt Design

```
You are a helpful assistant for AusBiz Fitness Center.
Only answer questions related to AusBiz Fitness Center.
Use the provided context to answer accurately.
If the answer is not in the context, say you don't have that information.
Always be friendly and professional.
```

---

## Acceptance Criteria (Technical)

- [ ] Chat UI loads correctly on desktop and mobile
- [ ] User question triggers vector search in Upstash
- [ ] Top 5 relevant chunks are retrieved correctly
- [ ] Groq LLM generates a response under 5 seconds
- [ ] System only answers AusBiz Fitness Center questions
- [ ] App deploys successfully on Vercel
- [ ] All environment variables are set correctly on Vercel
