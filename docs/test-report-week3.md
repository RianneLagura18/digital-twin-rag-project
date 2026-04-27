# Week 3 Test Report
## AusBiz Fitness Center — Digital Twin

**Tester:** Rion Poblete
**Week:** 3

---

## Summary

This report documents the QA testing activities conducted during Week 3 of the AusBiz Fitness Center Digital Twin project. Testing focused on MCP server functionality, RAG retrieval accuracy, and interview simulation results.

---

## Test Areas

### 1. MCP Server Testing
- [ ] MCP server starts without errors
- [ ] Tool definition is correctly structured
- [ ] Request handling returns expected responses
- [ ] Response formatting is clean and readable
- [ ] RAG retrieval returns relevant gym information

### 2. Vector Search Testing
- [ ] Upstash Vector index contains 45+ vectors
- [ ] Query: "membership price" returns correct pricing info
- [ ] Query: "opening hours" returns correct schedule
- [ ] Query: "fitness classes" returns list of classes
- [ ] Query: "gym facilities" returns equipment list
- [ ] Similarity scores above 0.7 for relevant queries

### 3. Interview Simulation Testing
- [ ] /interview folder contains one file per job description
- [ ] Each file contains HR, Technical, Team, Experience, Academic questions
- [ ] Each file contains a Pass/Fail decision
- [ ] Each file contains a percentage score (0-100%)
- [ ] Each file contains a hiring recommendation with rationale

### 4. Job Descriptions Testing
- [ ] /jobs folder contains minimum 5 job description files
- [ ] Each job sourced from real website (LinkedIn/Indeed/seek.com.au)
- [ ] Each job contains title, company, skills, responsibilities

---

## Issues Found

| Issue | Severity | Status |
|---|---|---|
| None found yet | - | - |

---

## Overall Test Result

| Area | Result |
|---|---|
| MCP Server | Pending |
| Vector Search | Pending |
| Interview Simulation | Pending |
| Job Descriptions | Pending |

---

## Recommendations

- Ensure all team members complete their Week 3 tasks before final submission
- Verify all interview simulation files follow the required format
- Confirm Upstash vector count is 45+ before taking screenshots
