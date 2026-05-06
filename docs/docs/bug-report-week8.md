# Bug Report — AusBiz Fitness Center Digital Twin
QA Tester: Rion Poblete

## CRITICAL BUG: Chatbot returns hardcoded response

URL: https://digital-twin-rag-project-two.vercel.app

### Test Results

| # | Question | Expected | Actual | Pass/Fail |
|---|----------|----------|--------|-----------|
| 1 | What are your membership prices? | Membership pricing info | Try basic workouts like push-ups and squats | FAIL |
| 2 | What time do you open? | Operating hours | Try basic workouts like push-ups and squats | FAIL |
| 3 | What fitness classes do you offer? | List of classes | Try basic workouts like push-ups and squats | FAIL |
| 4 | Do you have personal training? | Personal training info | Try basic workouts like push-ups and squats | FAIL |
| 5 | Where are you located? | Gym address | Try basic workouts like push-ups and squats | FAIL |

## Root Cause
RAG system not connected to Upstash Vector database.
Chatbot is returning a hardcoded response for all queries.

## Severity: CRITICAL
## Status: Open — awaiting fix from Backend Developer
