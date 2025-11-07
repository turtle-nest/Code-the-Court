# ⚖️ SocioJustice

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Design-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SocioJustice** is a lightweight web platform for managing and analyzing judicial decisions.  
It provides an intuitive interface to import, organize, and annotate court decisions — whether from **Judilibre** (the official French open justice API) or manually uploaded PDF archives.

---

## 🚀 Features

- 📥 **Import decisions** from Judilibre or upload PDF files  
- 🏛️ **Structured metadata** (jurisdiction, case type, keywords)  
- ✍️ **Notes & annotations** for qualitative research  
- 📊 **Dashboard** with mock statistics for demo and analysis  
- 🔐 **Secure authentication** (JWT-based)  
- 🌐 **Responsive UI** (desktop & tablet) built with React + Tailwind CSS  

---

## 🧩 Tech Stack

| Layer | Technology |
|:------|:------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT |
| External API | Judilibre (data.gouv.fr) |

---

## 🧰 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-username>/SocioJustice.git
cd SocioJustice

# 2️⃣ Setup backend
cd backend
npm install
cp .env.example .env
npm run dev

# 3️⃣ Setup frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
Then open http://localhost:5173

---

## 💡 Demo Mode

To display mock data (for presentation or testing):
```bash
# In frontend/.env
VITE_USE_STATS_MOCK=true
```
---

## 📚 Judilibre API

SocioJustice uses the Judilibre API
to access open judicial data from the Cour de cassation and other French jurisdictions.

---

## 👤 Author

Nicolas Lassouane
Holberton School — Software Engineering Program
Bordeaux, France
“It’s not by knowing the outcome that one succeeds,
but by daring to step out of the sand.”

---

## 📄 License
This project is licensed under the MIT License.
