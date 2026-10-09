# Smriti AI (स्मृति AI)

> **Remember what matters. Let AI handle the rest.**

---

## 🌟 Overview

**Smriti AI** is a mobile-first personal AI memory assistant web application designed to help individuals effortlessly capture, recall, and act upon personal facts, relationships, preferences, deadlines, and life events. 

Powered by **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) via the official `@google/genai` SDK and deployed on **Vercel Serverless**, Smriti AI grounds conversational responses strictly in your private, saved memories. It **never invents or hallucinates** personal facts and proposes structured actions (such as saving new memories or scheduling reminders) that **require explicit user confirmation** before anything is saved to your records.

---

## ✨ Key Features

### 1. 🧠 Personalized AI Memory Assistant
- **Strict Fact Grounding**: Answers questions using only your saved memories and scheduled reminders. If a fact is unknown, Smriti AI honestly reports that it has not been saved yet.
- **Action Proposal & Human-in-the-Loop Confirmation**: When you ask Smriti to remember an event or schedule a reminder, the AI proposes a structured action card with a preview. No data is created, edited, or modified without your explicit approval.
- **Session Continuity**: Multi-turn conversational context with instant retry and readable error diagnosis.

### 2. 📊 Live Dashboard
- **Personalized Greeting**: Dynamic, time-aware greeting ("Good morning", "Good afternoon", "Good evening") with live date display.
- **Live Metrics**: Real-time counts of saved memories, reminders due today, upcoming reminders, and overdue tasks.
- **Active Reminder Alert Banner**: Immediate visual notification whenever reminders are due or overdue.
- **Quick Capture Forms**: Inline quick-entry forms for both memories and reminders without navigating away.
- **Recent Activity Timeline**: Chronological log of recent additions, completions, and modifications.

### 3. 🗂️ "My Memories" (Full CRUD)
- **Comprehensive Fields**: Title, detailed content, category (*Birthday*, *People*, *Personal Goal*, *Important Event*, *Preference*, *Other*), date, person name, and timestamps.
- **Instant Search**: Real-time filtering by title, keywords, person, or category.
- **Category Pills**: One-click category filter navigation.
- **Safe Editing & Deletion**: Modal-based editing and explicit confirmation dialogs before deletion.

### 4. ⏰ Smart Reminders
- **Priority & Due Dates**: Low, Medium, and High priority flags with date and time pickers.
- **Status Workflows**: Categorized into *All*, *Upcoming*, *Overdue*, and *Completed* tabs.
- **Dynamic Overdue Detection**: Automatically checks deadlines against current client time.
- **One-Tap Completion**: Checkbox toggle to complete or reopen tasks with visual strikethrough.
- **Memory Linking**: Associate reminders with specific saved memories (e.g., link a gift purchase reminder to Rahul's birthday).

### 5. 🎙️ Voice & Audio Experience
- **Speech-to-Text Input**: Powered by the browser's native Web Speech API (`SpeechRecognition`).
- **Live Editable Transcription**: Voice transcription streams directly into the text box so you can review or edit before sending.
- **Text-to-Speech Playback**: Assistant responses can be read aloud using `window.speechSynthesis` with clear start/stop audio controls.
- **Graceful Degradation**: Clear messages and fallback if microphone permissions are denied or unsupported.

### 6. ⚙️ Settings, Privacy & Data Portability
- **Display Name Preference**: Personalize how Smriti addresses you.
- **Auto-Read Voice Toggle**: Automatically speak Gemini's responses.
- **JSON Backup Export & Import**: Download your entire memory vault to a JSON file or restore from a previous backup.
- **One-Click Demo Reset / Wipe Data**: Instant restoration of demo data for live presentations or clean resets.
- **Browser Notifications**: Optional native notification permission request.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with Vite (ES Modules) |
| **Styling & Design** | Tailwind CSS with custom navy (`#0B132B`) & violet (`#8B5CF6`) palette |
| **Icons** | Lucide React |
| **AI Model** | Google Gemini 3.8 Flash (`gemini-3.8-flash`) |
| **AI SDK** | Official `@google/genai` (v2.3.0+) |
| **Backend API** | Vercel Serverless Function (`/api/chat`) with Vite local development middleware |
| **Voice APIs** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Persistence** | Browser `localStorage` (local-first private storage) |
| **Deployment** | Vercel & GitHub compatible |

---

## 🔒 Security & Privacy Architecture

- **No Client-Side API Keys**: The Gemini API key is strictly maintained in server environment variables (`GEMINI_API_KEY`). It is **never** bundled into the client build or exposed via `VITE_` variables.
- **No Arbitrary Execution**: Gemini outputs validated JSON schemas (`{ reply, action }`). The application does not execute arbitrary code or unauthorized database operations.
- **Local-First Storage**: Memories and reminders are stored exclusively in your local browser profile via `localStorage`. Your personal facts are only sent ephemerally to the Gemini endpoint as context during active chat queries.
- **Git Protection**: `.gitignore` strictly excludes `.env`, `.env.local`, and build artifacts. Only `.env.example` with placeholders is committed.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: Version 18.x or 20.x
- **npm**: Version 9.x or higher
- **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Clone and Install
```bash
git clone https://github.com/your-username/Smriti.AI.git
cd Smriti.AI
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
GEMINI_MODEL=gemini-3.8-flash
```

> **Note**: `.env.local` is ignored by Git and will never be committed.

### 4. Run Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`. 
The local Vite server automatically handles `/api/chat` requests using `@google/genai` directly, providing full serverless feature parity locally!

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🧪 Demo Walkthrough (Live Demonstration Script)

Follow these 6 steps to demonstrate all key workflows during a live presentation:

1. **Save Rahul's Birthday as November 15**:
   - Open **Ask Smriti AI** from the navigation bar.
   - Type or speak: *"Remember that Rahul's birthday is November 15 and he loves sci-fi novels."*
   - Notice Smriti AI responds conversationally and displays a **Proposed Action card** previewing:
     - Type: `create_memory`
     - Title: `Rahul's birthday`
     - Category: `Birthday`
     - Date: `2026-11-15`
   - Click **Confirm & Save**. The action card updates to "Memory saved to your records!".

2. **Ask When Rahul's Birthday Is**:
   - In the chat, type or speak: *"When is Rahul's birthday?"*
   - Smriti AI references the saved memory context and answers accurately: *"Rahul's birthday is November 15. He also loves reading science fiction novels and drinking double espresso."*
   - Verify that the model accurately cited the saved facts without hallucinating.

3. **Ask for a Reminder Two Days Before It**:
   - In the chat, ask: *"Remind me two days before Rahul's birthday to buy him a sci-fi novel."*
   - Smriti calculates the date (November 13) and presents a **Proposed Action card**:
     - Type: `create_reminder`
     - Title: `Buy sci-fi novel for Rahul`
     - Scheduled Date: `2026-11-13`
     - Priority: `Medium`

4. **Confirm the Proposed Reminder**:
   - Click **Confirm & Save**.
   - Navigate to the **Reminders** tab: notice the reminder is listed under **Upcoming Reminders** with its scheduled date, priority, and link to Rahul's memory.

5. **Refresh the App and Verify Local Data Persistence**:
   - Press **F5** or refresh the browser.
   - Navigate to **Dashboard**, **My Memories**, and **Reminders**: all newly saved memories and reminders remain completely intact in `localStorage`.

6. **Test Voice Input (If Browser Supported)**:
   - In the chat input, click the **Microphone** icon.
   - Speak: *"Show my upcoming reminders."*
   - Verify the recognized speech appears in the input box, can be edited, and sends cleanly to Gemini.
   - Click the **Speaker icon** next to the AI's response to listen to the speech synthesis.

---

## 🚢 Deployment to Vercel

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Smriti AI memory assistant"
   git branch -M main
   git remote add origin https://github.com/your-username/Smriti.AI.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import your GitHub repository (`Smriti.AI`).
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `vite build`
   - Output Directory: `dist`

3. **Set Environment Variables in Vercel**:
   - Under **Project Settings** → **Environment Variables**, add:
     - `GEMINI_API_KEY`: `your_gemini_api_key`
     - `GEMINI_MODEL`: `gemini-3.8-flash`
   - Click **Deploy**.

4. **Verify Deployment**:
   - The frontend SPA routes via `vercel.json` rewrites.
   - The serverless function `/api/chat` is automatically deployed as a Vercel Serverless Function running Node.js.

---

## ⚠️ Honest Architectural Limitations & Prototype Notes

- **Browser-Local Persistence**: For this prototype, all memories, reminders, and settings are stored in browser `localStorage`. Data persists across page reloads and browser sessions on the same device and browser profile, but is **not automatically synchronized across different devices or user accounts**.
- **Database Extensibility**: The storage layer (`src/services/storageService.js`) uses a clean repository pattern with standard CRUD signatures (`getMemories`, `saveMemory`, `updateMemory`, `deleteMemory`). A remote database (such as Supabase, Firebase Firestore, or PostgreSQL) can be plugged in by swapping the storage service methods without refactoring the UI components.
- **Closed-Browser Scheduling**: Reminders trigger in-app visual banners and browser notifications while the browser tab is open. Because there is no persistent background worker or push notification server in this prototype, notifications will not alert the user when the browser is completely closed.
