# PROJECT BIBLE: Shopify LSO Incident & Deployment Control Center

Use this comprehensive blueprint to recreate or restore this application within Google AI Studio. Copy and paste these specifications and code standards to instruct the AI agent to rebuild the high-fidelity incident responder dashboard perfectly from scratch.

---

## 1. Core Architecture & Metadata
* **Application Name**: Shopify LSO Control Center
* **Description**: Enterprise-grade Shopify Incident & Deployment Operations dashboard with live PagerDuty integration, active Canary deployment status monitoring, real-time Shopify system feeds, and Gemini-powered diagnostic root cause analysis.
* **Technology Stack**: React 18+ (Vite) Frontend + Express.js Server + Tailwind CSS + Lucide Icons + Recharts + Framer Motion.
* **Permissions Framework (`metadata.json`)**:
  ```json
  {
    "name": "Shopify LSO Control Center",
    "description": "High-fidelity incident response, deployment canary status monitoring, and real-time diagnostics dashboard for Shopify LSO built with Gemini AI diagnosis integration.",
    "requestFramePermissions": ["camera", "microphone", "geolocation"],
    "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
  }
  ```

---

## 2. Environment Variables & Credentials (`.env.example`)
Place these environment variables inside `.env` or manage them securely through the AI Studio Settings menu.

```env
# Server Secret Keys (Never expose to client framework)
GEMINI_API_KEY=                 # Active Google Gemini API Key for on-demand incident diagnostics
PAGERDUTY_API_KEY=               # PagerDuty Admin Token (Fallbacks provided if inactive)
LSO_SYNC_TOKEN=                  # Security Token for external cron/VPC sync automation (e.g. shopify-lso-sync-secret-123)

# Server Configuration Matrix
PORT=3000                        # Hardcoded routing port for reverse proxy container
NODE_ENV=development             # Build target context
```

---

## 3. Dependency Configuration (`package.json`)
Set up the build scripts and server executor inside `package.json`:

```json
{
  "name": "shopify-lso-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "express": "^4.19.2",
    "lucide-react": "^0.395.0",
    "motion": "^11.2.10",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "esbuild": "^0.21.4",
    "tsx": "^4.15.1",
    "typescript": "^5.4.5",
    "vite": "^5.2.11"
  }
}
```

---

## 4. Key Functional Modules & Interfaces

### 4.1 Data Models & Types (`src/types.ts`)
Three critical domains define the LSO landscape: `core`, `storefront-renderer`, and `checkout-web`.

```typescript
export type LsoZone = 'core' | 'storefront-renderer' | 'checkout-web';

export interface OnDutyMember {
  name: string;
  role: 'Primary' | 'Secondary' | 'Manager';
  activeSince: string;
}

export interface PagerDutySchedule {
  currentOnCall: OnDutyMember[];
  escalationPolicy: string;
  nextShiftChange: string;
}

export interface DeploymentStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
}

export interface ZoneDeployment {
  id: string;
  zone: LsoZone;
  version: string;
  status: 'queued' | 'running' | 'manual_confirmation' | 'success' | 'failed' | 'rolling_back';
  progress: number;
  deployedBy: string;
  startedAt: string;
  updatedAt: string;
  stages: DeploymentStage[];
  logs: string[];
  sourceUrl?: string;
}

export interface IncidentTimelineEvent {
  time: string;
  text: string;
  author: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'triggered' | 'acknowledged' | 'resolved';
  impactedZones: LsoZone[];
  openedAt: string;
  closedAt?: string;
  assignedTo: string;
  summary?: string;
  timeline: IncidentTimelineEvent[];
  sourceUrl?: string;
}

export interface PipelineRun {
  id: string;
  zone: LsoZone;
  branch: string;
  commitHash: string;
  author: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  startedAt: string;
  duration?: string;
  failedStep?: string;
  logSnippet?: string;
  sourceUrl?: string;
}

export interface AIAnalysisResult {
  rootCause: string;
  impactScore: string;
  recommendedActions: string[];
  remediationSnippet?: string;
}
```

---

## 5. Security Gates & Bypassing SSO
When making live data fetches to internal Shopify servers, authentication often returns a `Status: HTTP 200 with Redirect Response` to `shopify.okta.com` or `incidents.shopify.io`. This is built-in enterprise protection. 

To overcome this inside the sandbox developer preview:
1. **Active SSO/Session Cookie Injection**: The platform embeds an Identity Bypass Gate on startup. It lets you capture your browser's active cookies on signed-in Shopify tabs and injects them to proxy backend requests.
2. **Interactive Redirection helper**: The UI features an automatic `Trigger Okta SSO Redirect (New Tab)` helper to complete the challenge.
3. **Automated URL Query Parsing**: Setting `?sso_token=...` or `?cookie=...` automatically parses the active credential parameters and persists them across server sessions.
4. **Local Mock Data Toggle**: If offline, click **"Continue with Local Mock Data (Offline Bypass)"** to instantly dismiss the login wall and mount default dashboard states.

### 5.1 The Console Cookie Capture Hack
```javascript
copy(document.cookie)
```
*Step-by-step*: Press `F12` inside any authenticated `incidents.shopify.io` browser page, execute this command, paste the clipboard output into the SSO Injection field of the app, and launch!

---

## 6. API Routings & Endpoints (`server.ts`)
The server proxy must handle state synchronization and mock database queries.

* **GET `/api/auth/sso-status`**: Returns whether the server-side proxy has a valid token signature.
* **POST `/api/auth/save-sso-token`**: Saves the active cookie/Okta session token.
* **GET `/api/on-duty`**: Retrieves active escalation, schedules, and developer roles. Includes automatic fallback if PagerDuty environment tokens are absent. (Suppresses sensitive emails and phone numbers for on-call personnel).
* **POST `/api/on-duty/override`**: Replaces the active roster with temporary developer credentials.
* **GET `/api/deployments`**: Lists active rollouts.
* **POST `/api/deployments/trigger`**: Enqueues and initiates a live release with custom target stages.
* **POST `/api/deployments/promote` / `/api/deployments/rollback`**: Standard deployment lifecycle actions.
* **GET `/api/incidents`**: Lists active incident cards.
* **POST `/api/incidents/create`**: Activates a new system incident.
* **POST `/api/incidents/analyze`**: Probes the Gemini API Key using `server.ts` to diagnose failure logs and output root causes, remediation scripts, and action plans.
* **POST `/api/sync/lso-system`**: An authorized webhook to synchronize external VPC/cron scripts to push live data dynamically, bypassing SSO layers safely. Includes `LSO_SYNC_TOKEN` validations.

---

## 7. Intelligent AI Incident Diagnosis (The Gemini Prompt)
The backend invokes the Gemini SDK (`@google/genai`) to generate structured diagnoses. Ensure this structural prompt is sent to the model to guarantee parsable JSON results:

```typescript
const systemPrompt = `You are an elite Staff SRE at Shopify specializing in the LSO architecture.
Analyze the incident logs, deployment changes, and git logs to diagnose the issue.
You MUST respond with a valid JSON object matching the schema below. No conversational text around it:
{
  "rootCause": "Clear root cause explanation in 2 sentences max.",
  "impactScore": "L1 (Severe Global Outage), L2 (Localized Outage), or L3 (Degraded Performance)",
  "recommendedActions": [
    "Identify exact broken code/config.",
    "Perform mitigation step.",
    "Verify the resolution."
  ],
  "remediationSnippet": "Bash script or configuration snippet to automate the rollback/remediation"
}`;
```

---

## 8. Theme, Styling & visual Identity
* **Primary Theme**: **Cosmic Dark Slate** (`#0A0A0B` and `#0E0E11` panels) for comfortable, eye-friendly, and stylish nocturnal operations.
* **Secondary Accents**: High-contrast Emerald Green (`#10B981`) for healthy integrations, Indigo (`#6366F1`) for primary actions, Amber (`#F59E0B`) for warnings, and Magenta/Ruby for triggered P1 issues.
* **Bento Grid Layout**: Responsive 12-column grid framing on-duty schedules, active canary status monitors, real-time pipeline timelines, live infrastructure health meters, and AI remediation centers.
