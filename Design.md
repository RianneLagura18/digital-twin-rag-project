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
- [x] Add "Peak Hour" logic to simulation 
- [ ] Integrate with Backend API (Coordination with Antonette)

## Data Integration Guide (For Team)
To retrieve the live state of any gym asset, use the following key-value pairs from `data/gym_status.json`:
- `status`: Current state (Available, In-Use, Maintenance)
- `usage_hours`: Cumulative wear-and-tear data.
- `last_updated`: Real-time sync timestamp.

**Example Query:** "Is Treadmill 1 available?" 
**RAG Logic:** Filter `equipment` where `name` == "Treadmill 1" and return `status`.