# System Design: Gym Digital Twin Simulation

## Simulation Architecture
The Digital Twin uses a **Python-based Telemetry Simulator** to provide real-time updates to the RAG system.

### Components:
1. **Physical State Storage (`data/gym_status.json`):** Stores the current attributes, status, and usage metrics of 15 gym assets.
2. **Simulation Logic (`simulator.py`):** A background process that updates machine states every 5-10 seconds to mimic real-world gym activity.
3. **Data Flow:** Simulator -> JSON -> RAG Chatbot (Knowledge Retrieval).

## Implementation Plan
- [x] Base JSON data structure (Week 6 Infrastructure)
- [x] Python Simulation script (Week 6 Infrastructure)
- [ ] Add "Peak Hour" logic to simulation (Next Step)
- [ ] Integrate with Backend API (Coordination with Antonette)