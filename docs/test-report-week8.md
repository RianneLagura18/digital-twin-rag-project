# Test Report — AusBiz Fitness Center Digital Twin
QA Tester: Rion Poblete


## Week 8 Testing Summary

### Live App URL
https://digital-twin-rag-project-two.vercel.app

### Test 1: App Accessibility
- Status: PASS
- App loads correctly on browser
- URL is accessible and live on Vercel

### Test 2: Chat Interface
- Status: PASS
- Input box works
- Send button works
- Response appears on screen

### Test 3: RAG Accuracy
- Status: FAIL
- All 5 test queries return same hardcoded response
- RAG not pulling from Upstash Vector database
- Bug report filed: docs/bug-report-week8.md

### Test 4: Response Speed
- Status: PASS
- Response appears under 5 seconds

### Overall Result: FAIL
- App is live but RAG system is broken
- Requires fix before Week 5 submission

## Recommendations
1. Fix Upstash Vector connection in backend code
2. Verify GROQ_API_KEY is set on Vercel
3. Verify UPSTASH_VECTOR_REST_URL and token are correct
4. Retest after fix is deployed
