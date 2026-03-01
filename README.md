# Orbital
Orbital is more than just a habit tracker—it’s a productivity engine built for those who want to gamify their discipline. Featuring a minimalist "Dark Space" aesthetic and smooth animations, Orbital provides a frictionless experience for visualizing progress and securing daily wins.

**The Mission Control for your Productivity.**
Orbital is a premium, full-stack productivity ecosystem designed to unify task management, focus tracking, and financial oversight into a single, high-performance command center. Built with a sleek, Neobrutalist dark-mode aesthetic, Orbital turns daily consistency into a highly visual, gamified experience.

## ✨ Core Modules

* **🔒 Authentication Fortress:** A highly secure, serverless login flow featuring real-time Regex validation, one-click Google OAuth, and native Firebase password resets.
* **⏱️ Focus Command:** Deep-work timers seamlessly synced with specific tasks to aggregate lifetime "Total Focus Hours."
* **🏆 Gamified Profile:** A personalized dashboard visualizing user momentum with dynamic streak calculations, lifetime task counters, and a premium "Deep Nebula" visual identity.
* **🌍 Global Access:** Real-time, on-the-fly UI localization (English, Hindi, Spanish, etc.) using persistent shared preferences.

## 🛠️ Tech Stack

Orbital utilizes a decoupled architecture to ensure lightning-fast UI rendering and secure background processing.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Flutter / Dart | High-fidelity, cross-platform UI and state management. |
| **Web UI** | React & Tailwind | Clean, component-based declarative rendering for web extensions. |
| **Database** | Firebase Firestore | Real-time, NoSQL cloud database for task and timer syncing. |
| **Auth** | Firebase Auth | Cryptographic user validation and session management. |
| **Serverless** | Node.js (Vercel) | Edge functions handling custom HTML email delivery via Nodemailer. |
| **Core API** | Rust | High-performance backend routing and heavy data lifting. |

## 🏗️ System Architecture Highlights

* **Reactive State Management:** Utilizes Firebase's `userChanges()` streams integrated with Flutter `StreamBuilder`s to guarantee that identity updates propagate instantly across the entire application without requiring reloads.
* **Serverless Email Delivery:** Bypasses standard Firebase email templates by routing auth tokens to a dedicated Vercel Node.js endpoint, wrapping cryptographic verification links in custom, Neobrutalist HTML designs.
* **Efficient Data Aggregation:** Uses Firestore `count()` queries and combined collection fetches to calculate lifetime statistics (tasks, focus hours, streaks) without draining read quotas.
