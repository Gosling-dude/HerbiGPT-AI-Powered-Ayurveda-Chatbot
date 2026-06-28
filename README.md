# 🌿 HerbiGPT - AI-Powered Ayurveda Chatbot

[🔗 have a look](https://herbigpt.netlify.app/)

HerbiGPT is an AI-powered chatbot tailored for Ayurveda enthusiasts. Using advanced **RAG (Retrieval Augmented Generation)** techniques, it provides accurate and reliable responses about Ayurvedic practices, herbs, remedies, and lifestyle guidance. Whether you're a seasoned practitioner or just curious about holistic health, **HerbiGPT** is your go-to companion for natural wellness.

## Some Examples of Data Sources:

### 🌐 10 Ayurvedic Websites & Blogs
 
- [Banyan Botanicals Blog](https://www.banyanbotanicals.com/info/ayurvedic-living)  
- [National Institute of Ayurveda](https://www.nia.nic.in)  
- [Ayurvedic Institute](https://www.ayurvedicinstitute.org/blog)  
- [Kerala Ayurveda](https://www.keralaayurveda.us/blog)  
- [The Ayurveda Experience](https://theayurvedaexperience.com/blog)  
- [Joyful Belly](https://joyfulbelly.com/category/ayurveda)  
- [Dr. Vasant Lad’s Ayurvedic Institute](https://www.ayurveda.com/)  
- [Panchakarma Retreats (Ayurvedic Healing)](https://www.panchakarma.com/articles)  
- [SC Ayurvedic Pharmacy](https://www.scspondon.com/blog)  

> _Each of these sites publishes practitioner‑reviewed articles on herbs, diets, doshas, treatments, and lifestyle tips._

---

### 📚 20+ Classic & Modern Ayurvedic Books

- *Charaka Samhita* – (translated by P.V. Sharma)  
- *Sushruta Samhita* – (translated by K.R. Srikantha Murthy)  
- *Ashtanga Hridayam* – (translated by Prof. K.R. Srikantha Murthy)  
- *Bhavaprakasha* – (by Bhavamisra, translated by Ram Karan Sharma)  
- *Sharangdhar Samhita* – (by Sharangdhar)  
- *Kashyapa Samhita* – (on pediatrics, by Kashyapa)  
- *Yoga Vashishta* – (for mind‑body integration)  
- *Rasa Ratna Samuccaya* – (on herbo‑mineral formulations)  
- *Dravyaguna Vijnana* – (on pharmacology of herbs)  
- *Panchakarma Therapy* – (by Dr. Umarani)  
- *The Complete Book of Ayurvedic Home Remedies* – Vasant Lad  
- *Ayurveda: The Science of Self-Healing* – Dr. Vasant Lad  
- *Textbook of Ayurveda, Vol. I–III* – Vasant Lad  
- *Ayurvedic Cooking for Self‑Healing* – Usha and Vasant Lad  
- *Prakriti: Your Ayurvedic Constitution* – Dr. Robert Svoboda  
- *Ayurveda and Panchakarma* – Dr. Sunil V. Joshi  
- *The Everyday Ayurveda Cookbook* – Kate O’Donnell  
- *Ayurvedic Medicine: The Principles of Traditional Practice* – Sebastian Pole  
- *Ayurveda: A Life of Balance* – Maya Tiwari  
- *Practical Ayurveda: Find Out Who You Are and What You Need to Bring Balance to Your Life* – Sada Shiva Tirtha  
- *Ayurveda Personal Wellness Handbook* – Acharya Dr. Kuldeep Singh  
- *The Charaka Samhita (Sutra Sthana)* – P.V. Sharma (detailed commentary)  
- *Clinical Methods in Ayurvedic Medicine* – Dr. David Frawley  


## ✨ Features

✅ **Curated Ayurveda Knowledge Base**  
A built-in, hand-curated knowledge base derived from classical Ayurvedic texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam, Bhavaprakasha and more) covering:
- Medicinal herbs (Ashwagandha, Turmeric, Tulsi, Triphala…)
- Dosha balancing (Vata, Pitta, Kapha)
- Dietary principles & weight management
- Daily routines (Dinacharya), Panchakarma & Yoga

✅ **Retrieval-Augmented Generation (RAG)**  
Each question first retrieves the most relevant passages from the knowledge base, then feeds them as context to the LLM — producing grounded, source-attributed answers.

✅ **Graceful Fallback Mode**  
No API key? No problem. The backend automatically falls back to high-quality, pre-written responses from the knowledge base, so the app stays fully demoable without any secrets.

✅ **Clean, Modern UI**  
A responsive React interface with markdown rendering, glassmorphism, light/dark themes, and a conversational chat experience.

> ℹ️ **Honest note:** the `data_scraping/` folder contains a large raw corpus (scraped articles + book texts) gathered during research. The *running* app currently uses a curated in-memory knowledge base rather than the full scraped corpus. Upgrading to a vector store over the full corpus is on the roadmap (see [Roadmap](#-roadmap)).

---

## 🛠 Tech Stack

| Layer              | Technologies & Tools                                          |
|--------------------|--------------------------------------------------------------|
| **Frontend**       | React 18, TypeScript, react-markdown, CSS (glassmorphism)     |
| **Backend**        | Node.js, Express 5, TypeScript, Zod, Helmet, Winston          |
| **AI / LLM**       | Groq API (Llama 3.1) with a keyword-RAG retrieval layer       |
| **Architecture**   | MCP-style server orchestration (LLM / Knowledge / Monitoring / Data) |
| **Data (research)**| Python, BeautifulSoup, OCR — see `data_scraping/`             |
| **Deployment**     | Netlify (Frontend), Render (Backend)                          |

---

## 🚀 Local Development & Deployment

### 📁 Clone the repository
```bash
git clone https://github.com/Gosling-dude/HerbiGPT---Your-Holistic-Wellness-Guide.git
cd HerbiGPT---Your-Holistic-Wellness-Guide

```
---

### ⚡ One-Command Run (recommended)

A root `package.json` runs **both** servers together — this avoids the most common
mistake of starting the frontend without the backend (which shows *"Failed to fetch"*).

```bash
# From the repo root (first time only):
npm run install:all      # installs root + backend + frontend deps

# Optional: enable full LLM responses
cp backend/.env.example backend/.env   # then set GROQ_API_KEY=...

# Start backend (3001) + frontend (3000) together:
npm run dev
```

Then open **http://localhost:3000**. Stop both with `Ctrl+C`.

> Prefer separate terminals? Use the manual setup below.

---

### 📦 **Backend Setup**

```bash
cd backend
npm install

# Configure environment (optional — runs in fallback mode without a key)
cp .env.example .env
# then edit .env and set GROQ_API_KEY=... for full LLM responses

# Development (auto-reload):
npm run dev

# — or — production build + run:
npm run build
npm start
```
The backend runs on **http://localhost:3001** (health: `/health`, ask: `POST /ask`).

---

### 💻 **Frontend Setup**
```bash
cd frontend
npm install
npm start
```
The frontend runs on **http://localhost:3000** and talks to the backend via
`REACT_APP_API_URL` (already set to `http://localhost:3001` in `frontend/.env.development`).

---

### ✅ Quick Run (Windows PowerShell)

```powershell
# Install dependencies (first time only)
cd backend; npm install; cd ../frontend; npm install; cd ..

# Terminal 1 — backend
cd backend; npm run dev

# Terminal 2 — frontend
cd frontend; npm start
```

Open **http://localhost:3000**.

**Environment notes**
- `GROQ_API_KEY` is **optional**. Without it, the backend answers from the curated knowledge base (fallback mode). With it, you get full Llama-3.1 responses via Groq.
- The default backend port is `3001` (override with `PORT` in `backend/.env`).
- **Production frontend:** before running `npm run build`, set `REACT_APP_API_URL` in `frontend/.env.production` to your deployed backend URL. If it is left empty, the built site will call relative paths and fail with *"Failed to fetch."*

---

## 🌍 **Deployment Instructions**
🔸 **Frontend (Netlify)**
Set base directory as frontend

Build command: npm run build

Publish directory: frontend/build

🔸 **Backend (Render)**
Create a new web service (a ready-made `render.yaml` is included).

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: set `NODE_ENV=production`, `HOST=0.0.0.0`, and (optionally) `GROQ_API_KEY`. Set `CORS_ORIGIN` to your Netlify URL.

## 🧭 Roadmap

- Replace the keyword retriever with a true vector store (embeddings) over the full `data_scraping/` corpus.
- Persist multi-turn conversation history.
- Streaming token responses.

## 🙌 **Contributing**
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 **License**
MIT License — Feel free to use, modify, and share.
## 💬 **Contact**
Feel free to connect with me via [LinkedIn](https://www.linkedin.com/in/sumit-chauhan-006399257/) or drop a message if you'd like to collaborate!


## 👥 Contributors

### 🧠 **Sumit Chauhan**  
**Role:** Project Lead & AI Integration Engineer  
**Contributions:**  
- Designed and implemented the **RAG (Retrieval Augmented Generation)** system  
- Collected and curated large-scale **Ayurvedic datasets**  
- Integrated AI pipelines with backend architecture  
- Led system design and overall project coordination  

---

### 💻 **Xaomiung Codie**  
**Role:** Frontend Developer & System Integrator  
**Contributions:**  
- Developed an elegant **React-based frontend** for smooth user interaction  
- Connected **UI queries** to backend AI logic via **Express.js**  
- Implemented real-time **response rendering** and clean UI display  
- Enhanced overall user experience and app performance  

