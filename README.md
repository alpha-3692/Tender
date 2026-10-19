# TenderMitra — AI-Powered Tender Management Platform

TenderMitra is a web-based platform designed to help Micro, Small, and Medium Enterprises (MSMEs) manage tender opportunities and organize tender-related documents through a centralized workspace.

The project is currently under development.

## ✨ Features

- **User Authentication:** User registration, login, and JWT-based authentication.
- **Dashboard:** A workspace for accessing tender information.
- **Tender Management:** Create, view, and manage tender records.
- **Tender Explorer:** Browse available tenders and review details such as organization, reference number, deadline, and estimated value.
- **Document Vault:** Upload, view, and download tender PDF documents.
- **Company-Based Data Access:** Restrict tender and document access according to the authenticated user's company.
- **REST API:** FastAPI endpoints for frontend-backend communication.

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- JWT authentication

### Database and Storage
- PostgreSQL
- Local file storage for uploaded PDF documents

## 📁 Project Structure

```text
Tender/
├── backend/
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── storage/
│   └── main.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following tools before running the project:

- Python 3.11 or later
- Node.js and npm
- PostgreSQL 16 or a compatible PostgreSQL installation
- Git

Docker can be used to run PostgreSQL locally.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/alpha-3692/Tender.git
cd Tender
```

### 2. Configure the backend

Open a terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the Python packages required by your backend. Use the project's dependency file if available; otherwise, install the packages listed in your backend imports.

Create a `.env` file inside `backend/` and configure your local database connection and authentication secret.

Example configuration:

```env
DATABASE_URL=postgresql+psycopg://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5433/YOUR_DB_NAME
SECRET_KEY=REPLACE_WITH_A_SECURE_RANDOM_SECRET
```

Use your own local database credentials. Never commit your `.env` file or real secrets to GitHub.

Start the backend:

```powershell
python -m uvicorn main:app --reload --port 8001
```

Backend API: http://127.0.0.1:8001

Interactive API documentation: http://127.0.0.1:8001/docs

### 3. Configure the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

http://localhost:5173

If that port is already occupied, Vite may choose another available port.

## 🔐 Security Notes

- Keep environment variables and authentication secrets out of version control.
- Do not commit database backups or private tender documents.
- Use strong, unique secrets for local and production environments.
- Company-based access controls should be tested before deploying the application.

## 🗺️ Future Improvements

Planned areas for development include:

- AI-assisted tender qualification and eligibility analysis.
- Tender document summarization and requirement extraction.
- Deadline reminders and tender tracking.
- Advanced search and filtering.
- Production deployment and automated testing.

These are planned improvements and may not yet be implemented.

## 👨‍💻 Development Status

TenderMitra is an actively developing project. Features, APIs, and setup instructions may change as development progresses.

## 📄 License

No license has been specified yet. All rights are reserved by default unless a license is added to this repository.
