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

✅ **Comprehensive Knowledge Base**  
Trained on 2500+ Ayurveda articles and 30+ certified books via OnDemand’s API, offering rich and accurate information about:
- Medicinal herbs
- Dietary plans
- Mental wellness
- Yoga practices
- Lifestyle suggestions

✅ **Holistic Health Support**  
More than symptom treatment — HerbiGPT focuses on balance and well-being across body, mind, and spirit.

✅ **Easy-to-Use Interface**  
Clean and minimal UI built in React, ensuring users can access Ayurvedic advice without confusion or clutter.

✅ **AI-Powered Intelligence**  
Utilizes Retrieval Augmented Generation (RAG) and modern LLM pipelines for contextual, real-time answers.

---

## 🛠 Tech Stack

| Layer              | Technologies & Tools                             |
|-------------------|--------------------------------------------------|
| **Frontend**       | React, JavaScript, HTML, CSS                     |
| **Backend**        | Node.js, Express.js, OnDemand API                |
| **AI / ML**        | Python, LangChain, Scikit-Learn, **RAG (Retrieval Augmented Generation)** |
| **Scraping & Tools** | BeautifulSoup, Tesseract OCR                     |
| **Deployment**     | Netlify (Frontend), Render (Backend)            |

---

## 🚀 Local Development & Deployment

### 📁 Clone the repository
```bash
git clone https://github.com/Gosling-dude/HerbiGPT---Your-Holistic-Wellness-Guide.git
cd HerbiGPT---Your-Holistic-Wellness-Guide

```
---

### 📦 **Backend Setup**

```bash
cd backend
npm install
node server.js
```
The backend will run on http://localhost:5000

---

### 💻 **Frontend Setup**
```bash
cd ../frontend
npm install
npm start
```
The frontend will run on http://localhost:3000

---

### ✅ Quick Run (updated for this repo)

If you just want to run the project locally (backend + frontend) quickly, use these commands from the repository root on Windows PowerShell:

```powershell
# Install dependencies (first time only)
cd backend; npm install; cd ../frontend; npm install

# Start backend (from repo root)
cd backend; node server_groq.js

# In a separate terminal, start frontend
cd frontend; npm start
```

Open the frontend at `http://localhost:3000`. The backend API runs at `http://localhost:3001` (health: `/health`, ask: `/ask`).

Notes:
- The repo includes a local fallback LLM stub for demo responses; real LLM integrations may require API keys and extra configuration.
- If ports are in use, change the port in `backend/server_groq.js` and restart.

---

## 🌍 **Deployment Instructions**
🔸 **Frontend (Netlify)**
Set base directory as frontend

Build command: npm run build

Publish directory: frontend/build

🔸 **Backend (Render)**
Create a new web service

Set root directory to /backend

Use node server.js as the start command

Ensure environment supports Node.js + required dependencies

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

