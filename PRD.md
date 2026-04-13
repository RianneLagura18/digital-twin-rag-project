## Digital Twin I - PRD

## Project Overview
RAG-based AI assistant for gym-related queries.

## Objectives
- Answer fitness questions
- Provide workout and diet suggestions

## Frontend / UI Plan

### Overview
The frontend will provide a simple and user-friendly interface for gym-related queries.

### Features
- Input field for user questions (e.g., workouts, diet, exercises)
- Chat-like interface to display AI responses
- Suggested questions (e.g., "Best workout for beginners")
- Loading indicator while processing
- Error messages for invalid inputs

### User Flow
1. User opens the interface
2. User types a question
3. System processes the query
4. Response is displayed
5. User can ask follow-up questions

## Digital Twin / Simulation - Siv

### Use Case
The Digital Twin will act as the "Live Knowledge Base" for the chatbot. It allows the AI to provide real-time updates on gym equipment availability and health status.

### Simulation Idea
* **Virtual Asset Modeling:** We will model 15 assets (Treadmills, Squat Racks, Cable Machines).
* **Real-time Telemetry Simulation:** A Python script will generate mock data for each machine:
    * `status`: (Available / In-Use / Maintenance)
    * `usage_frequency`: (High / Medium / Low)
    * `estimated_wait_time`: (Minutes)
* **Integration:** The simulation will update a local JSON/Markdown file, which the RAG system will query to provide dynamic answers like "Which treadmill is free?" or "When was the leg press last cleaned?"

---
## 5. Digital Twin / Simulation - Siv

### Use Case: Real-Time Gym Status Engine
The Digital Twin will act as the "Live Knowledge Base" for our Gym Chatbot. It allows the AI to provide real-time updates on equipment availability and maintenance.

### Simulation Idea
* **Virtual Asset Modeling:** We will model 15 assets (5 Treadmills, 3 Squat Racks, 2 Bench Presses, 5 Cable Machines).
* **Real-time Telemetry Simulation:** I will create a Python script to generate mock data for:
    * `status`: (Available / In-Use / Maintenance)
    * `usage_frequency`: (High / Medium / Low)
    * `last_cleaned`: (Timestamp)
* **Integration:** This simulation will update a local JSON file. The RAG system will query this file to answer questions like *"Which treadmill is free?"* or *"When was the leg press last cleaned?"*
## Backend Developer - Antonette

- Build APIs for the digital twin system  
- Handle data processing and storage  
- Integrate sensors or simulated data  
- Ensure system performance and security  
