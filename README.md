# 🎓 AssignmentAI – AI Assignment Generator

Upload a Word file (.docx) with assignment questions and get a **complete, formatted assignment** written by the Hugging Face **Mixtral-8x7B** AI model — with your **name and enrollment number** in the document header.

---

## 📁 Project Structure

```
assignment-generator/
├── backend/                    ← Node.js + Express API
│   ├── server.js               ← Main server entry point
│   ├── routes/
│   │   └── assignment.js       ← /api/generate and /api/preview routes
│   ├── services/
│   │   ├── huggingface.js      ← Manually calls HF Inference API (NO SDK)
│   │   └── docxGenerator.js   ← Generates formatted .docx output
│   ├── .env.example            ← Copy to .env and add your HF token
│   └── package.json
│
└── frontend/                   ← React app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js              ← Main app component
    │   ├── App.css             ← Global styles
    │   ├── index.js            ← React entry point
    │   ├── components/
    │   │   ├── FileUploader.js          ← Drag & drop file upload
    │   │   ├── FileUploader.module.css
    │   │   ├── PreviewPanel.js          ← Assignment preview with formatted display
    │   │   └── PreviewPanel.module.css
    │   └── services/
    │       └── api.js          ← Axios calls to backend
    └── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 — Get a Hugging Face API Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"New token"**
3. Give it a name, set role to **"Read"**, and create it
4. Copy the token (starts with `hf_...`)

---

### Step 2 — Setup Backend

```bash
cd backend

# Copy .env file
cp .env.example .env

# Open .env and paste your token:
# HF_API_TOKEN=hf_your_token_here

# Install dependencies
npm install

# Start the server
npm run dev    # with auto-reload (nodemon)
# OR
npm start      # without auto-reload
```

Backend runs at: **http://localhost:5000**

---

### Step 3 — Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🚀 How to Use

1. Open **http://localhost:3000** in your browser
2. Enter your **Full Name**
3. Enter your **Enrollment / Roll Number**
4. Upload your assignment **.docx file** (the one with questions)
5. Click **"Generate Assignment"**
6. Wait 1–3 minutes (Hugging Face cold start is normal)
7. Preview the generated assignment in the browser
8. Click **"Download .docx"** to get the final file with your name & enrollment in the header

---

## 🤖 AI Model Used

| Setting | Value |
|---------|-------|
| Provider | Hugging Face Inference API |
| Model | `mistralai/Mixtral-8x7B-Instruct-v0.1` |
| SDK used | ❌ None — raw `fetch()` call only |
| Max tokens | 2048 |
| Temperature | 0.7 |

### Changing the Model

Open `backend/services/huggingface.js` and change `MODEL_ID`:

```js
// Options:
const MODEL_ID = "mistralai/Mixtral-8x7B-Instruct-v0.1";   // Default (best quality)
const MODEL_ID = "HuggingFaceH4/zephyr-7b-beta";            // Lighter, faster
const MODEL_ID = "tiiuae/falcon-7b-instruct";               // Alternative
```

---

## 📋 API Endpoints

### `POST /api/preview`
Returns generated assignment text as JSON (used for browser preview).

**Form Data:**
- `file` — .docx file
- `studentName` — string
- `enrollment` — string

**Response:**
```json
{
  "success": true,
  "studentName": "Rahul Sharma",
  "enrollment": "21BCE1234",
  "generatedContent": "...",
  "wordCount": 1250
}
```

---

### `POST /api/generate`
Returns a formatted `.docx` file as a download.

**Form Data:** Same as `/preview`

**Response:** Binary `.docx` file stream

---

## ❓ Troubleshooting

| Issue | Fix |
|-------|-----|
| `HF_API_TOKEN is not set` | Create `.env` from `.env.example` and add your token |
| `Model is loading (503)` | Wait 30 seconds and retry — Hugging Face cold starts |
| `Rate limit (429)` | Wait 1 minute — free tier has limits |
| `Invalid token (401)` | Re-generate token at huggingface.co/settings/tokens |
| Frontend can't reach backend | Make sure backend is running on port 5000 |
