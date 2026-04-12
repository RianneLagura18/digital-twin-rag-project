# Agents Guide
## AusBiz Fitness Center — Digital Twin

---

## Purpose

This file tells AI agents and tools how to behave when working inside this project. Read this before generating any code, content, or responses related to the AusBiz Fitness Center digital twin.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (TypeScript) |
| Styling | Tailwind CSS |
| AI Model | Groq Cloud — llama-3.1-8b-instant |
| Vector Database | Upstash Vector (BGE_SMALL_EN_V1_5 embeddings) |
| Deployment | Vercel |
| Language | TypeScript |

---

## Architecture

- The user sends a question via the chat UI.
- The question is converted into an embedding and queried against the Upstash Vector database.
- The top 5 most relevant chunks from the gym's knowledge base are retrieved.
- These chunks are passed as context to the Groq LLM along with the user's question.
- The LLM generates a response grounded in the retrieved context.
- The response is displayed in the chat UI.

---

## Conventions

- All API calls to Groq must use direct client instantiation inside the server action.
- Vector queries must use: `index.query({ data: question, topK: 5, includeMetadata: true })`
- The system prompt must instruct the LLM to only answer questions about AusBiz Fitness Center.
- Do not expose API keys in client-side code. Use environment variables only.
- Environment variables required:
  - `UPSTASH_VECTOR_REST_URL`
  - `UPSTASH_VECTOR_REST_TOKEN`
  - `GROQ_API_KEY`

---

## Project Structure

```
/
├── app/                  # Next.js app directory
├── lib/                  # Utility functions and API helpers
├── data/                 # Raw gym knowledge base data
├── docs/
│   └── prd.md            # Product Requirements Document
├── agents.md             # This file
└── README.md             # Project overview
```

---

## Requirements Reference

See [`/docs/prd.md`](./docs/prd.md) for full product requirements, acceptance criteria, and business information.
