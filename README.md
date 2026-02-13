# TalentFlow 🚀

**A Modern, Browser-Based Hiring Platform**

TalentFlow is a responsive Applicant Tracking System (ATS) featuring a Kanban-style workflow, real-time dashboard analytics, and persistent state management. Built entirely with Vanilla JavaScript to demonstrate core DOM manipulation and state logic without external frameworks.

![TalentFlow App Screenshot](./screenshot.png)


## 🔗 Live Demo
**[View Live Demo Here](#)**

## ✨ Key Features

### 🎨 UI/UX Design
* **Glassmorphism Aesthetic:** Modern UI with frosted glass effects, semi-transparent cards, and a "Corporate Deep Blue" gradient theme.
* **Responsive Layout:** Fully responsive CSS Grid/Flexbox architecture. The sidebar collapses automatically on mobile devices.
* **Interactive Elements:** Smooth CSS transitions for hover states, modal pop-ups, and view switching.

### ⚙️ Technical Functionality
* **Full CRUD Operations:** Create new candidates, Read their status, Update via drag-and-drop, and Delete records.
* **Drag & Drop Kanban:** Native HTML5 Drag and Drop API implementation for moving candidates between stages (Applied → Interview → Hired).
* **State Persistence:** Uses `localStorage` to save data. The application state remains intact even after refreshing the browser.
* **Dynamic Analytics:** The dashboard automatically calculates and updates metrics (Total Candidates, Hired Count, Pending).

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Variables, Grid, Flexbox, Animations)
* **Logic:** Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage API)
* **Icons:** Phosphor Icons (via CDN)
* **No Frameworks:** Built from scratch to demonstrate foundational web development skills.

## 📂 Project Structure

```text
/TalentFlow
  ├── index.html        # Main application structure
  ├── style.css         # Styling (Glassmorphism, Responsive logic, Dark Mode)
  ├── app.js            # Application logic (State management, Drag & Drop)
  └── README.md         # Documentation
