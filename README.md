# ReflectAI - User-Authenticated Mindful Journal & AI Reflection Assistant
[![Google Cloud Run](https://img.shields.io/badge/Deployed%20on-Google%20Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%20Flash%20Ladder-8E75B2?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Firebase Firestore](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Maps](https://img.shields.io/badge/Maps-Google%20Maps%20Platform-34A853?logo=google-maps&logoColor=white)](https://mapsplatform.google.com/)

A secure, private, multi-tenant AI journaling and mindfulness sanctuary built with **React 19**, **Tailwind CSS**, **Node.js/Express**, **Cloud Firestore**, **Google Maps Platform**, and the **Gemini Flash Ladder**.

- 🌐 **Live Production App**: [https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app](https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app)
- 📂 **GitHub Repository**: [https://github.com/dixitanshika0309-creator/AI-journal](https://github.com/dixitanshika0309-creator/AI-journal)
- ⚡ **Challenge Hashtag**: `#AccelerateAIwithCloudRun`

---

## 🏆 Challenge Evaluation Overview

| Evaluation Dimension | Architecture & Feature Proof |
| :--- | :--- |
| **Authenticity** | Multi-turn AI reflection workflows with 4 distinct cognitive lenses (Mindful Reflection, Brainstorm Solutions, Root Cause Deep-Dive, Action Plan), Google Maps sanctuary pinning, telemetry observability console, and SSRF-safe webhook integration. |
| **Usability** | Passwordless Google Federated Identity (Firebase Auth), zero-latency client state sync, auto-saving drafts, Markdown rendering with un-truncated advice, export to Markdown/PDF, and instant search filters. |
| **Stability** | Resilient 5-model Gemini Fallback Ladder (`gemini-3.8-flash` → `gemini-3.1-flash-lite` → `gemini-3.6-flash` → `gemini-flash-latest` → `gemini-3.7-flash`), jittered auto-retry, and SSRF-hardened outbound webhooks. |
| **Security** | Zero hardcoded keys, Google Cloud Secret Manager integration, owner-bound multi-tenant Firestore Security Rules (`request.auth.uid == userId`), strict payload sanitization, and immutable audit logging. |

---

## 🔍 How to Test & Evaluate Every Feature

Use this step-by-step evaluation guide to test each functional module of the application.

### Test Case 1: Google Federated Identity & Auth Gate
- **Objective**: Verify secure authentication without local password handling.
- **Action**:
  1. Open the application URL in a clean browser window or incognito tab.
  2. You will see the Welcome / Sign-in screen.
  3. Click **"Sign In with Google"**.
  4. Complete Google authentication in the popup.
- **Expected Outcome**:
  - The application logs in, displays your user profile (avatar, name, email) in the top header and sidebar.
  - The personal journal vault opens immediately.
  - Clicking **"Sign Out"** returns securely to the locked auth screen.

### Test Case 2: Create a Journal Entry & Thought Starters
- **Objective**: Verify entry initialization and writing ergonomics.
- **Action**:
  1. Click **"+ New Entry"** in the sidebar.
  2. You will see 5 quick thought starters (e.g., *"Unpack a decision I am wrestling with right now"*, *"Reflect on a challenge from today"*).
  3. Click any thought starter or enter your own custom text in the input box.
- **Expected Outcome**:
  - The prompt is loaded into the composer.
  - A new entry is created with an auto-saved draft timestamp.
  - The sync indicator in the header indicates **"Synced"**.

### Test Case 3: 4-Lens Multi-Turn AI Reflections
- **Objective**: Verify multi-turn conversational AI feedback with dynamic cognitive modes.
- **Action**:
  1. In the composer toolbar, notice the 4 mode tabs:
     - **Mindful Reflection** (Gentle emotional validation)
     - **Brainstorm Solutions** (Creative framing shifts)
     - **Root Cause Analysis / Deep Dive** (Underlying psychological drivers)
     - **Action Plan** (Practical, small next steps)
  2. Select **"Mindful Reflection"**, type: *"I am feeling overwhelmed with my upcoming deadlines and unsure where to start."*
  3. Click **"Send"** (or press Enter).
  4. Once Gemini responds, switch the mode tab to **"Action Plan"** and type: *"Give me 3 small micro-habits I can start today to get unstuck."*
  5. Click **"Send"**.
- **Expected Outcome**:
  - An animated thinking spinner appears (*"Reflecting with Gemini..."*).
  - The model returns empathetic, structured Markdown without cutting off or stripping sentences.
  - The entry's title is automatically updated (e.g., *"Navigating Deadline Overwhelm"*).
  - Mood tag is detected (e.g., *Overwhelmed* or *Thoughtful*).
  - The response includes structured **Core Takeaways** bullet points.
  - Full conversation history is maintained and persisted across turns.

### Test Case 4: Location-Aware Mindful Sanctuaries (Google Maps Platform)
- **Objective**: Verify Google Maps Platform integration with attribution tracking (`gmp_mcp_codeassist_v1_aistudio`).
- **Action**:
  1. In the active journal entry header, click the **"Pin Place"** button.
  2. A modal appears with two options:
     - **Search Sanctuaries**: Type a query like *"botanical garden"*, *"library"*, or *"peaceful park"*.
     - **Use My Current Location**: Click to use browser geolocation and reverse geocoding.
  3. Click any result (e.g., a serene park or landmark).
- **Expected Outcome**:
  - The sanctuary is pinned to the journal entry.
  - A green badge appears in the header showing the place name and street address (e.g., `Central Park • New York, NY`).
  - Clicking the badge opens Google Maps with full place details in a new tab.
  - The location is permanently saved to Firestore.

### Test Case 5: One-Click Journal Summarization
- **Objective**: Verify the dedicated AI synthesis engine.
- **Action**:
  1. On any journal entry with at least one conversation turn, click the **"Summarize"** button in the header.
- **Expected Outcome**:
  - Gemini analyzes the entire multi-turn thread and generates a concise synthesis.
  - A highlighted **Summary** card appears in the entry view containing an executive summary, emotional trajectory, and core themes.

### Test Case 6: Admin Telemetry & RBAC Observability Dashboard
- **Objective**: Verify real-time metrics, system health, and security audit logs.
- **Action**:
  1. In the top navigation bar, click the **"Admin & RBAC"** button (shield icon).
  2. Inspect the 3 dashboard tabs:
     - **System Telemetry**: Displays total reflection count, error count, uptime (99.9%), and AI latency tracking in milliseconds.
     - **Model Distribution**: Visualizes which Gemini model was utilized (e.g., `gemini-3.8-flash`, `gemini-3.1-flash-lite`).
     - **Security Audit Logs**: Displays immutable timestamped records of security events (e.g., `REFLECTION_GENERATED`, `ROLE_UPDATED`, `WEBHOOK_TRIGGERED`).
     - **User Roles (RBAC)**: Shows user directory with role badges (`admin`, `editor`, `member`).
- **Expected Outcome**:
  - All metrics render live from server-side telemetry.
  - Every AI generation updates the latency graph and increments the audit log.

### Test Case 7: SSRF-Hardened Webhook Notifications
- **Objective**: Verify external notification dispatch with SSRF protection.
- **Action**:
  1. In the top navigation bar, click **"Webhooks"**.
  2. Select **Slack** or **Discord** webhook preset.
  3. Enter a valid webhook URL (or click *"Send Test Webhook"* with the default mock payload).
  4. Test SSRF protection: Enter a loopback/private URL like `http://127.0.0.1:8080` or `http://169.254.169.254/latest/meta-data/` and click Send.
- **Expected Outcome**:
  - Valid webhook destinations dispatch an event containing `event_type`, `summary`, and `timestamp`.
  - Loopback or internal RFC 1918 private subnet URLs are blocked with an SSRF security rejection.

### Test Case 8: Multi-Format Export (Markdown & PDF/Print)
- **Objective**: Verify offline exportability of reflections.
- **Action**:
  1. Open any completed journal entry.
  2. Click **"Export"** in the top right.
  3. Choose **"Export as Markdown (.md)"**.
  4. Choose **"Print / Save as PDF"**.
- **Expected Outcome**:
  - A clean `.md` file downloads containing the entry title, date, mood, tags, pinned sanctuary address, summary, and conversation transcript.
  - The print view opens a print-optimized document with page margins.

### Test Case 9: Instant Search & Mood Filters
- **Objective**: Verify fast client-side vault search and mood filtering.
- **Action**:
  1. In the sidebar, type keywords in the search bar (searches titles, tags, and reflection content).
  2. Click the mood filter dropdown to filter entries by specific moods (e.g., *Reflective*, *Overwhelmed*, *Grateful*).
- **Expected Outcome**:
  - The entries list updates in real time with zero latency.

---

## 🛡️ Agentic Threat Modeling (5 Threat Zones)

| Threat Zone | Threat Scenario & Vector | Enterprise Countermeasure Implemented |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt injection, repetitive loops, payload overflow | Strict schema validation, repetitive token loop stripping (`cleanLoopingString`), and defensive request body decoding. |
| **2. Planning & Reasoning** | System instruction bypass, unauthorized tool routing | Server-side locked system prompts with enforced structured JSON schema contracts (`responseSchema`). |
| **3. Tool Execution** | SSRF on outbound webhooks, private subnet port scanning | Strict IP and hostname validation blocking RFC 1918 subnets, `localhost`, `127.0.0.1`, and cloud metadata endpoints (`169.254.169.254`). |
| **4. Memory & State** | Cross-user data leaks, unauthorized Firestore reads/writes | Multi-tenant owner-bound paths `/users/{userId}/...` enforced by `firestore.rules` (`request.auth.uid == userId`) with explicit deny-all fallback. |
| **5. Inter-System Communication** | Gemini/Maps API token exfiltration, client key exposure | Zero hardcoded keys; 100% server-side proxying via `/api/gemini/*` and `/api/maps/*` with Google Cloud Secret Manager integration. |

---

## 🔒 Secure Firestore & Firebase Auth Configuration

Deploy the following owner-bound rules in `firestore.rules` to enforce complete data isolation between users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🔐 Google Cloud Secret Manager Configuration

To securely manage your Gemini API credentials on Google Cloud without hardcoding keys:

```bash
# 1. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com

# 2. Create and populate the GEMINI_API_KEY secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run runtime service account permission to access the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment

Deploy the application to Google Cloud Run with container-level Secret Manager injection:

```bash
# Deploy to Cloud Run
gcloud run deploy reflectai-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 🏷️ Required Campaign Verification Label

Register the deployed Cloud Run service for the automated challenge verification:

```bash
gcloud run services update reflectai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server (Express backend + Vite on port 3000)
npm run dev

# Run TypeScript linting
npm run lint

# Compile production bundle
npm run build
```

---

## 📣 Social Post Showcase & Challenge Submission Templates

### Option 1: LinkedIn / Professional Post

```text
🚀 Excited to unveil ReflectAI for the Google Cloud Run & AI Studio Challenge! #AccelerateAIwithCloudRun

Most AI-generated apps look great in a demo but fall apart in production: hardcoded API keys, unauthenticated backends, shared databases with zero tenant isolation, and brittle API calls that fail during traffic surges.

For this challenge, I didn't just build the baseline "Personal Gemini Journal" — I used Google AI Studio configured with strict production directives to build an enterprise-hardened AI reflection platform:

✨ What Makes ReflectAI Unique:
🧠 4 Cognitive Reflection Lenses: Multi-turn conversational journaling supporting Mindful Validation, Brainstorming, Root-Cause Deep Dives, and Micro Action Planning.
🛡️ 5-Model Fallback Ladder: 99.9% uptime architecture automatically failing over across gemini-3.8-flash, gemini-3.1-flash-lite, gemini-3.6-flash, gemini-flash-latest, and gemini-3.7-flash.
📍 Location-Aware Mindful Sanctuaries: Pinned real-world places powered by Google Maps Platform APIs (gmp_mcp_codeassist_v1_aistudio).
🔒 Zero-Trust Architecture: Passwordless Google Federated Identity (Firebase Auth), owner-bound Firestore security rules, and SSRF-hardened Slack/Discord webhooks.
📊 Observability Console: Real-time telemetry dashboard monitoring AI latency, model distribution, and immutable security audit trails.

Deployed seamlessly to Google Cloud Run in a single container!

Check out the live app and let me know your thoughts:
🔗 Live Production App: https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app
📦 GitHub Repository: https://github.com/dixitanshika0309-creator/AI-journal

#GoogleCloud #GeminiAI #CloudRun #FullStack #AIStudio #WebDev #CyberSecurity
```

---

### Option 2: X (Twitter) Post

```text
Shipped ReflectAI for the #AccelerateAIwithCloudRun Challenge! 🚀

Configured Google AI Studio with enterprise directives to turn the baseline Personal Gemini Journal into a production-grade reflection platform:

✨ 4 Multi-Turn Reflection Lenses (Mindful, Brainstorm, Root Cause, Action Plan)
🔄 5-Model Resilient Fallback Ladder (zero 503 drops)
📍 Google Maps Platform Sanctuary Pinning
🛡️ Strict Owner-Bound Firestore Security Rules & Secret Manager
📊 Live Admin Telemetry & SSRF-Protected Webhooks

Deployed to Google Cloud Run! ☁️

🌐 Live App: https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app
📦 GitHub Repo: https://github.com/dixitanshika0309-creator/AI-journal

#GoogleCloud #GeminiAI @GoogleCloud @GoogleAI
```

---

## ✍️ Technical Blog Post (Dev.to / Medium / Hashnode / GitHub Discussion)

*Copy and publish this article directly on your blog:*

```markdown
# How I Built ReflectAI: Transforming a Simple AI Journal into an Enterprise-Grade Platform on Google Cloud Run

Every developer who has played with LLM starters knows the classic pitfalls: hardcoded API keys in client bundles, databases allowing global reads and writes, single-turn prompts that truncate mid-sentence, and apps that break the moment an API encounters a 503 spike.

For the **Google Cloud Run & AI Studio Challenge**, my goal was to take the foundational "Personal Gemini Journal" concept and architect it from the ground up using **Google AI Studio** backed by enterprise security, resilience, and UX directives.

The result is **ReflectAI** — a private, multi-turn AI reflection platform deployed on Google Cloud Run.

- 🌐 **Live Application**: [https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app](https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app)
- 📂 **Source Code (GitHub)**: [https://github.com/dixitanshika0309-creator/AI-journal](https://github.com/dixitanshika0309-creator/AI-journal)

---

## 1. The 4 Evaluation Pillars

### 💡 Authenticity: Beyond the Prompt Box
Rather than a plain text area that queries Gemini once, ReflectAI introduces:
- **4 Dynamic Cognitive Modes**: Users can guide their reflections through *Mindful Reflection* (emotional grounding), *Brainstorming* (creative framing), *Root Cause Deep-Dive* (uncovering subconscious beliefs), or *Action Plan* (generating actionable micro-habits).
- **Google Maps Mindful Sanctuaries**: Using the Google Maps Places and Geocoding APIs (`gmp_mcp_codeassist_v1_aistudio`), users can tag meaningful real-world locations or their current GPS coordinates as grounding spots for their entries.
- **Export Versatility**: Clean Markdown and print-ready PDF export options with full metadata and pinned addresses.

### 👥 Usability: Frictionless & Focused
- **Passwordless Federated Identity**: Authentication runs via Firebase Auth and Google Sign-In — user credentials and passwords never touch the server.
- **Auto-Saving Drafts**: Non-blocking client synchronization saves drafts to Cloud Firestore in real time.
- **Full Conversational Memory**: Gemini retains multi-turn context with auto-titling, mood tag categorization, and core takeaway extraction without truncation.

### ⚡ Stability: The 5-Model Gemini Fallback Ladder
In production, LLM APIs experience transient spikes and quota exhaustion. ReflectAI guards every call with a resilient automated fallback ladder:
1. `gemini-3.8-flash` (Primary high-performance engine)
2. `gemini-3.1-flash-lite` (High-availability failover)
3. `gemini-3.6-flash` (Stable foundation)
4. `gemini-flash-latest` (Dynamic alias)
5. `gemini-3.7-flash` (Deep reasoning fallback)

Coupled with defensive payload ingestion and undefined-stripping before database writes, the application prevents unhandled runtime rejections.

### 🛡️ Security: Agentic Threat Modeling & Zero Hardcoding
Before writing code, the system was configured around **The 5 Threat Zones**:
- **Input Surfaces**: Input schemas strip runaway repetitive token loops (`cleanLoopingString`).
- **Planning & Reasoning**: Prompts are enforced server-side using strict JSON schema contracts (`responseSchema`).
- **Tool Execution (SSRF Protection)**: Outgoing webhook notifications to Slack and Discord block RFC 1918 private subnets, `localhost`, and cloud metadata endpoints (`169.254.169.254`).
- **State Isolation**: Multi-tenant paths (`/users/{userId}/entries/{entryId}`) are guarded by strict Firestore Security Rules requiring `request.auth.uid == userId` with an explicit deny-all fallback.
- **Zero Key Leakage**: Keys are stored exclusively in **Google Cloud Secret Manager** and injected into Cloud Run at runtime.

---

## 2. Cloud Run Deployment Command

Deploying to Cloud Run with automatic Secret Manager mounting and challenge verification labels:

```bash
gcloud run deploy reflect-ai-journal \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --update-labels dev-tutorial=cloud-run-ai-challenge
```

---

## 3. Experience It Live

- **Try the App**: [https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app](https://ais-pre-od5reugthjeaojre6e4jtl-482442335221.asia-southeast1.run.app)
- **Explore the Code**: [https://github.com/dixitanshika0309-creator/AI-journal](https://github.com/dixitanshika0309-creator/AI-journal)
```


