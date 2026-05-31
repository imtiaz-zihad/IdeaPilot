# 🚀 IdeaPilot

IdeaPilot is an AI-powered startup co-founder platform that helps entrepreneurs turn raw ideas into validated, investor-ready startups. It works as a virtual AI business partner that handles idea validation, market research, business planning, financial forecasting, branding, and pitch deck creation in one place.

## 📌 Description
IdeaPilot — AI startup co-founder that validates startup ideas, generates business plans, analyzes markets, predicts financial growth, and builds investor-ready pitch decks.

## 🧠 Problem
Founders struggle with idea validation, market research, competitor analysis, financial planning, and pitch preparation. IdeaPilot solves this by automating the entire startup creation process using AI.

## ✨ Features
AI Idea Validator (scores idea 0–100 based on demand, competition, scalability), AI Market Research (competitor analysis, SWOT, industry insights, TAM/SAM/SOM), AI Financial Forecaster (revenue prediction, burn rate, profit timeline, CAC/LTV estimation), AI Business Plan Generator (go-to-market strategy, revenue model, target audience), AI Branding Assistant (startup names, slogans, domain ideas, branding concepts), AI Pitch Deck Generator (auto slides for problem, solution, market, financials, export PDF), AI Co-Founder Chat (context-aware startup guidance and business advice), Startup Dashboard (manage ideas, reports, analytics).

## 🌐 Live Demo

Front-end: https://idea-pilot-one.vercel.app

Back-end: https://ideapilot-in2u.onrender.com

---

## 🏗️ Tech Stack
Frontend: Next.js, React.js, Tailwind CSS, Framer Motion, Recharts  
Backend: Node.js, Express.js  
Database: MongoDB  
AI: OpenAI API  
Auth: JWT + Google/GitHub OAuth  
Storage: Cloudinary / AWS S3  
Deployment: Vercel (frontend), Render (backend), MongoDB Atlas (database)

## 🧱 Architecture
Frontend (Next.js) → Backend (Express.js + Node.js) → AI Layer (OpenAI API) → Database (MongoDB)

## 🗂️ Database Collections
users, startups, aiReports, businessPlans, marketResearch, financialForecasts, pitchDecks, brandingAssets, conversations

## 🚀 Getting Started
Clone repo: git clone https://github.com/imtiaz-zihad/ideapilot.git  
Install frontend: cd client && npm install && npm run dev  
Install backend: cd server && npm install && npm run dev  

Create .env file:  
MONGO_URI=your_mongodb_connection  
JWT_SECRET=your_secret  
OPENAI_API_KEY=your_key  
CLOUDINARY_CLOUD_NAME=  
CLOUDINARY_API_KEY=  
CLOUDINARY_API_SECRET=  

## 📡 API Endpoints
/auth/register, /auth/login  
/startups/create, /startups/:id  
/ai/validate-idea, /ai/business-plan, /ai/financial-forecast, /ai/branding, /ai/pitch-deck  

## 📊 Future Improvements
AI competitor tracking, real-time collaboration, investor marketplace, funding recommendations, trend prediction, hiring suggestions, advanced analytics dashboard.

## 🧠 Why This Project Matters
IdeaPilot demonstrates full-stack SaaS development, AI integration, scalable backend architecture, database design, and real-world startup problem solving with product thinking.

## 👨‍💻 Author
Imtiaz Zihad — Full Stack Developer (MERN)  
GitHub: https://github.com/imtiaz-zihad

## ⭐ Support
Star the repo if you like this project and share it with developers and founders.
