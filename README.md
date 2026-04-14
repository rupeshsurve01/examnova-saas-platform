# ExamNova

ExamNova is a full-stack MERN SaaS-style online examination platform built around **teacher-owned workspaces**. Each teacher gets a private workspace code, students join that teacher's exam space with the code, and exams/results stay scoped to the teacher workspace.

The project is designed as a resume-ready SaaS product demo with role-based flows, timed exams, retake limits, answer review, teacher analytics, print/export support, and workspace-based student access.

## Live Demo

- Frontend: https://examnova-saas-platform.vercel.app
- Backend: https://examnova-backend.onrender.com

## What Problem It Solves

Teachers need a simple way to create online exams, share them with only their own students, manage attempts, and review results. Students need a focused exam-taking flow where they can join the correct teacher workspace, attempt published exams, and review their performance.

ExamNova solves this with:

- Teacher workspace codes for multi-tenant access
- Teacher-owned exam management
- Student workspace join flow
- Timed exam attempts with retake policies
- Detailed result review and teacher analytics

## Core Features

### Authentication And Roles

- JWT authentication
- Password hashing with bcrypt
- Role-based access for:
  - Student
  - Teacher
  - Org admin support in backend routes
- Protected frontend routes
- Token-based API requests through Axios interceptors

### Teacher Workspace Multi-Tenancy

- Each teacher acts as a workspace tenant
- Teachers receive a unique `workspaceCode`
- Students join a teacher workspace by entering that code
- Students only see published exams from joined teacher workspaces
- Students cannot directly access another teacher's exam without joining the workspace

### Teacher Exam Management

- Create exam
- Edit full exam details:
  - Title
  - Description
  - Duration
  - Total marks
  - Exam code
  - Publish status
  - Retake settings
- Archive exams
- Safe delete exams only when no attempts exist
- Risk warnings when editing important exam settings after attempts already exist
- Clean teacher dashboard with compact action menu

### Question Management

- Add questions to exams
- Edit existing questions
- Delete questions safely
- Correct answer selection
- Marks per question
- Teacher question bank view

### Student Exam Flow

- Join teacher workspace using workspace code
- View only exams from joined teacher workspaces
- Start/resume exam attempts
- Attempt limits shown before starting
- Timed exam interface
- Low-time warnings
- Auto-submit when time expires
- Temporary local answer auto-save using `localStorage`
- Auto-save status indicator

### Retake Support

- Teacher can enable/disable retakes
- Teacher can configure maximum attempts
- Student dashboard shows:
  - Used attempts
  - Max attempts
  - Attempts remaining
  - Active attempt status
- Result routes are attempt-based, so multiple attempts are tracked correctly

### Results And Analytics

- Student result page with:
  - Score summary
  - Correct answers count
  - Incorrect answers count
  - Not answered count
  - Answer-by-answer review
  - Correct/selected option highlighting
  - Print/export result support
- Student attempt history with:
  - Search
  - Sorting
  - Filtering
  - Attempt cards
  - View result action
- Teacher results page with:
  - Total attempts
  - Highest score
  - Average score
  - Latest submission
  - Per-student analytics
  - Search, sorting, and filtering
  - Print/export teacher results

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS v4
- Custom CSS for dashboard/result/print layouts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Project Structure

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

## Local Setup

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

### 3. Create Backend Environment File

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

The backend should run at:

```txt
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd client
npm install
```

### 6. Create Frontend Environment File

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployed frontend, use:

```env
VITE_API_URL=https://examnova-backend.onrender.com/api
```

### 7. Start Frontend

```bash
npm run dev
```

The frontend should run at:

```txt
http://localhost:5173
```

## Deployment Notes

### Backend On Render

Use these settings:

```txt
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Add environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Frontend On Vercel

Use these settings:

```txt
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add environment variable:

```env
VITE_API_URL=https://examnova-backend.onrender.com/api
```

## Demo Flow

Use this flow when showing the project:

1. Register or log in as a teacher
2. Copy the teacher workspace code from the dashboard
3. Create an exam
4. Add questions
5. Publish the exam
6. Register or log in as a student
7. Join the teacher workspace using the workspace code
8. Start the exam
9. Submit answers
10. Review the detailed result page
11. Log back in as teacher
12. Open teacher results and analytics
13. Print/export the result report

## Resume Summary

Built ExamNova, a multi-tenant MERN exam SaaS platform with teacher-owned workspaces, workspace-code student access, exam authoring, timed attempts, retake limits, answer auto-save, detailed result review, print/export reports, and teacher analytics.

## Future Improvements

- Archived exams restore page
- Teacher dashboard search and filters
- Custom modals instead of browser alerts/confirms
- Backend partial answer auto-save
- Charts for teacher analytics
- Stronger admin/org management if expanding beyond teacher-owned workspaces

## Status

This project is deployed and resume-demo ready. The core exam platform, teacher workspace access model, student attempt flow, analytics, and print/export features are implemented.
