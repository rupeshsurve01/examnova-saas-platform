<div align="center">

# 🚀 ExamNova

### 🎓 Multi-Tenant Teacher Workspace SaaS for Online Exams

ExamNova is a full-stack MERN SaaS-style examination platform where each teacher owns a private workspace, students join using a teacher workspace code, and exams/results stay scoped to that teacher workspace.

<br />

<a href="https://examnova-saas-platform.vercel.app">
  <img src="https://img.shields.io/badge/🚀%20Open%20Live%20Demo-2563EB?style=for-the-badge&logo=vercel&logoColor=white" alt="Open Live Demo" />
</a>

<br />
<br />

<p>
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

<p>
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=111827" alt="Render" />
</p>

<br />

<a href="#-live-demo"><strong>🚀 Live Demo</strong></a>
&nbsp;&nbsp;|&nbsp;&nbsp;
<a href="#-core-features"><strong>✨ Features</strong></a>
&nbsp;&nbsp;|&nbsp;&nbsp;
<a href="#-local-setup"><strong>🛠️ Setup</strong></a>
&nbsp;&nbsp;|&nbsp;&nbsp;
<a href="#-demo-flow"><strong>🎬 Demo Flow</strong></a>

</div>

---

## 🚀 Live Demo

| Service | URL |
| --- | --- |
| 🌐 Frontend | [Open ExamNova](https://examnova-saas-platform.vercel.app) |
| ⚙️ Backend | [Render API](https://examnova-backend.onrender.com) |

---

## 🧠 Overview

ExamNova is built around a **teacher-workspace multi-tenant model**.

Instead of every student seeing every published exam, each teacher gets a private workspace code. Students enter that code to join the teacher's exam space and can only access exams from workspaces they have joined.

This makes the app suitable for a SaaS-style resume project because it demonstrates:

| SaaS Capability | How ExamNova Handles It |
| --- | --- |
| Tenant model | Teacher-owned workspaces |
| Access control | Students join by workspace code |
| Data isolation | Students only see exams from joined teachers |
| Role-based flows | Teacher and student dashboards |
| Reporting | Attempt history, result review, teacher analytics |
| Lifecycle management | Create, edit, publish, archive, safe delete |

---

## ✨ Core Features

### 🔐 Authentication And Role Access

| Feature | Status |
| --- | --- |
| JWT authentication | Implemented |
| Password hashing with bcrypt | Implemented |
| Student and teacher role flows | Implemented |
| Protected frontend routes | Implemented |
| Axios token interceptor | Implemented |

### 🏫 Teacher Workspace Multi-Tenancy

- 🧑‍🏫 Each teacher acts as a workspace owner.
- 🔑 Teachers receive a unique `workspaceCode`.
- 🎒 Students join a teacher workspace using that code.
- 🧭 Students only see published exams from joined teacher workspaces.
- 🛡️ Students cannot directly access another teacher's exam without joining that workspace.

### 🧑‍🏫 Teacher Features

| Area | Features |
| --- | --- |
| Dashboard | Workspace code, exam cards, compact action menu |
| Exam creation | Title, description, duration, marks, exam code, retake policy |
| Full exam editing | Edit details, publish status, retake settings |
| Question management | Add, edit, delete questions |
| Exam lifecycle | Publish, archive, safe delete |
| Safety | Risk warnings after attempts exist |
| Results | Attempt records, per-student analytics, search/sort/filter |
| Export | Print/export teacher results |

### 🎒 Student Features

| Area | Features |
| --- | --- |
| Workspace join | Join teacher workspace using code |
| Exam access | See only joined-workspace exams |
| Attempt flow | Start/resume exams |
| Timer | Countdown, low-time warning, auto-submit |
| Auto-save | Temporary local answer auto-save |
| Results | Score summary and answer-by-answer review |
| History | Search, sort, filter attempt history |
| Export | Print/export result page |

---

## 🔁 Exam Flow

```txt
Teacher registers
  -> Teacher gets workspace code
  -> Teacher creates exam
  -> Teacher adds questions
  -> Teacher publishes exam
  -> Student registers
  -> Student joins teacher workspace using code
  -> Student starts exam
  -> Timer runs and answers auto-save locally
  -> Student submits
  -> Student reviews detailed result
  -> Teacher reviews analytics
```

---

## 🧰 Tech Stack

### 🎨 Frontend

| Tool | Purpose |
| --- | --- |
| React 19 | UI |
| Vite | Build tooling |
| React Router | Routing |
| Axios | API calls |
| Tailwind CSS v4 | Utility styling |
| Custom CSS | Dashboard, result, print layouts |

### 🧩 Backend

| Tool | Purpose |
| --- | --- |
| Node.js | Runtime |
| Express.js | API server |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| CORS | Cross-origin API access |
| dotenv | Environment variables |

### ☁️ Deployment

| Platform | Usage |
| --- | --- |
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 📁 Project Structure

```txt
examnova-saas-platform/
  client/
    src/
      components/
      context/
      pages/
      services/
    package.json
  server/
    controllers/
    middleware/
    models/
    routes/
    index.js
    package.json
```

---

## 🛠️ Local Setup

### 1. Clone The Repository

```bash
git clone <your-repo-url>
cd examnova-saas-platform
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 4. Start Backend

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd client
npm install
```

### 6. Configure Frontend Environment

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployed frontend:

```env
VITE_API_URL=https://examnova-backend.onrender.com/api
```

### 7. Start Frontend

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## ☁️ Deployment

### ⚙️ Backend On Render

Use these settings:

```txt
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 🌐 Frontend On Vercel

Use these settings:

```txt
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variable:

```env
VITE_API_URL=https://examnova-backend.onrender.com/api
```

---

## 🎬 Demo Flow

Use this flow for recruiters, interviews, and project demos:

| Step | Action |
| --- | --- |
| 1 | Register or log in as a teacher |
| 2 | Copy teacher workspace code |
| 3 | Create an exam |
| 4 | Add questions |
| 5 | Publish the exam |
| 6 | Register or log in as a student |
| 7 | Join teacher workspace using the code |
| 8 | Start and submit the exam |
| 9 | Review detailed result page |
| 10 | Log back in as teacher |
| 11 | Open teacher results and analytics |
| 12 | Print/export result report |

---

## 💼 Resume Summary

> Built ExamNova, a multi-tenant MERN exam SaaS platform with teacher-owned workspaces, workspace-code student access, exam authoring, timed attempts, retake limits, answer auto-save, detailed result review, print/export reports, and teacher analytics.

---

## 🧭 Future Improvements

- 📦 Archived exams restore page
- 🔎 Teacher dashboard search and filters
- 🪟 Custom modals instead of browser alerts/confirms
- 💾 Backend partial answer auto-save
- 📊 Charts for teacher analytics
- 🏢 Stronger admin/org management if expanding beyond teacher-owned workspaces

---

## ✅ Status

ExamNova is deployed and resume-demo ready. The core exam platform, teacher workspace access model, student attempt flow, analytics, and print/export features are implemented.
