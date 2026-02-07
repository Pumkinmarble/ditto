# Backboard Dashboard Checklist

When you log into https://app.backboard.io, look for these things:

## 🔍 What to Look For:

### 1. Documentation/Docs Section
- [ ] API Reference
- [ ] Quickstart Guide
- [ ] Code Examples (Python, JavaScript, TypeScript)
- [ ] Endpoint List

### 2. Example Code
Look for examples showing:
- [ ] How to create an assistant
- [ ] How to create a thread/conversation
- [ ] How to send messages
- [ ] How to add documents/memory
- [ ] API authentication format

### 3. Interactive API Explorer
- [ ] Swagger/OpenAPI docs
- [ ] API playground/tester
- [ ] Try-it-now buttons

### 4. Settings/API Keys Section
- [ ] Example requests
- [ ] cURL examples
- [ ] SDK installation instructions

## 📝 What We Need:

### Critical Info:
1. **Endpoint Format**: What's the correct path?
   - `/api/assistants` or `/api/v1/assistants`?
   - `/api/threads` or something else?

2. **Request Format**: What fields are required?
   ```json
   {
     "name": "...",
     "model": "...",  // or "llm_model_name"?
     "provider": "..." // or "llm_provider"?
   }
   ```

3. **Authentication**: Confirm header format
   - `X-API-Key: espr_...` ✅ (we confirmed this works)

4. **Response Format**: What does the API return?
   ```json
   {
     "id": "...",
     "name": "...",
     // what other fields?
   }
   ```

## 🎯 Priority Questions:

1. **How do you create an assistant/agent?**
2. **How do you start a conversation (thread)?**
3. **How do you add diary entries to memory?**
4. **How do you query with RAG?**

## 🐛 Meanwhile, Run This:

While you're checking the dashboard, run this to see what endpoints work:

```bash
npm run ai:test  # (we can add debug script to package.json)
```

Or manually:
```bash
npx tsx AI/debug-api.ts
```

This will test common endpoint patterns and show us what the API expects!

---

**Copy any code examples you find** - even Python examples help us understand the structure!
