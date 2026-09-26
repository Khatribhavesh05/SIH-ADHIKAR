# Adhikar — National Land Acquisition & Management Command Center

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Digitizing India's RFCTLARR Act, 2013 land acquisition process — end-to-end, in real time.

[![Live Product](https://img.shields.io/badge/🔗_Live_Product-adhikar.tech-2ea44f?style=for-the-badge)](https://adhikar.tech)
[![Video Walkthrough](https://img.shields.io/badge/🎥_Video_Walkthrough-YouTube-red?style=for-the-badge)](https://youtu.be/8kwJE8ULGLo)
[![SIH 2026](https://img.shields.io/badge/🏆_Smart_India_Hackathon-2026-orange?style=for-the-badge)](https://sih.gov.in)

**Problem Statement:** SIH26016 · Ministry of Rural Development · Team **ICARUS**

</div>

---

## 📌 The Problem

India's land acquisition process isn't broken by law — it's broken by execution.

The **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)** is clear and well-defined, but its real-world execution runs through disconnected, manual channels: gazette notifications, newspaper publications, village notice boards, physical files, and manually maintained records.

```mermaid
flowchart LR
    A[Gazette Notifications] --> E[No Central Record]
    B[Newspaper Publications] --> E
    C[Village Notice Boards] --> F[No Real-Time Visibility]
    D[Manually Maintained Files] --> G[No Deadline Tracking]
    E --> H[Fragmented Execution]
    F --> H
    G --> H

    style A fill:#fde2e2,stroke:#c0392b
    style B fill:#fde2e2,stroke:#c0392b
    style C fill:#fde2e2,stroke:#c0392b
    style D fill:#fde2e2,stroke:#c0392b
    style H fill:#c0392b,color:#fff
```

> **35% of stalled highway projects** were delayed due to land acquisition disputes
> — *2025 Parliamentary Standing Committee Report, Ministry of Road Transport & Highways*

---

## 💡 The Solution

**Adhikar** is a national land acquisition and management command center that digitizes all **nine stages** of the RFCTLARR lifecycle into one unified, real-time platform.

> *"Digitize the paper trail and the statutory clock — not the land itself."*

```mermaid
flowchart TD
    S1["1. Preliminary Notification<br/>Sec. 11"] --> S2["2. SIA<br/>Sec. 4-9"]
    S2 --> S3["3. Expert Appraisal<br/>Sec. 7"]
    S3 --> S4["4. Consent<br/>80%/70% Private/PPP"]
    S4 --> S5["5. Declaration<br/>Sec. 19"]
    S5 --> S6["6. Award<br/>Sec. 25-30"]
    S6 --> S7["7. Disbursement<br/>Sec. 30(3)"]
    S7 --> S8["8. Possession<br/>Sec. 24(2)"]
    S8 --> S9["9. R&R<br/>Sec. 31-45"]

    style S1 fill:#3498db,color:#fff
    style S2 fill:#3498db,color:#fff
    style S3 fill:#3498db,color:#fff
    style S4 fill:#2ecc71,color:#fff
    style S5 fill:#f39c12,color:#fff
    style S6 fill:#e67e22,color:#fff
    style S7 fill:#e74c3c,color:#fff
    style S8 fill:#9b59b6,color:#fff
    style S9 fill:#1abc9c,color:#fff
```

Every statutory action is mapped to a digital system record:

```mermaid
flowchart LR
    Act[Act] --> Stage[Stage] --> Action[Action] --> Doc[Document] --> Time[Timestamp]
    style Act fill:#2c3e50,color:#fff
    style Stage fill:#2c3e50,color:#fff
    style Action fill:#2c3e50,color:#fff
    style Doc fill:#2c3e50,color:#fff
    style Time fill:#2c3e50,color:#fff
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **GIS & Interactive Mapping** | Parcel-level visualization with risk-based color coding (on track / at risk / delayed / completed) |
| ⏱️ **Deadline Tracker & Alerts** | Automatic tracking of every statutory deadline with proactive notifications |
| 💰 **Transparent Compensation Engine** | Base land value + standing assets + solatium + rural factor + delay interest — fully auditable |
| 📊 **National Dashboard** | Real-time project counts, area notified vs. acquired, compensation disbursed, state-wise breakdown |
| 📄 **Automated Document Generation** | Gazette notifications, SIA reports, consent records, award statements, R&R reports (PDF/Excel export) |
| 🔐 **Role-Based Access Control** | Ministry (central), District Collector, Requiring Body, R&R Authority — with row-level security |
| 📝 **Full Audit Trail** | Every action logged: who, what, when, which stage, which document |

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Frontend
        UI["Next.js + React + TypeScript<br/>Tailwind CSS"]
    end

    subgraph API["API Layer"]
        Routes["Next.js API Routes<br/>Server Actions"]
    end

    subgraph Data["Data Layer"]
        DB[("Supabase<br/>PostgreSQL + PostGIS")]
        Prisma["Prisma ORM<br/>Migrations"]
    end

    subgraph External["Integrations"]
        Maps["Google Maps API"]
        Auth["Supabase Auth"]
    end

    UI <--> Routes
    Routes <--> Prisma
    Prisma <--> DB
    Routes <--> Maps
    Routes <--> Auth

    style UI fill:#000,color:#fff
    style Routes fill:#333,color:#fff
    style DB fill:#3ECF8E,color:#000
    style Prisma fill:#2D3748,color:#fff
    style Maps fill:#4285F4,color:#fff
    style Auth fill:#3ECF8E,color:#000
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js · React · TypeScript · Tailwind CSS
- **Backend:** Next.js API Routes (Server Actions)
- **Database:** Supabase (PostgreSQL + PostGIS for spatial data)
- **ORM:** Prisma (schema migrations, version-controlled)
- **Maps:** Google Maps API (geocoding & visualization)
- **Deployment:** Vercel (application) · Supabase (database & storage)
- **Security:** HTTPS · server-side authorization · row-level security (RLS) on all tables

---

## ✅ Feasibility

| Dimension | Why It Holds Up |
|-----------|-----------------|
| **Legal** | Built entirely on the existing RFCTLARR Act, 2013 — no new legislation required |
| **Technical** | Production-grade, widely-adopted stack — no experimental technology |
| **Economic** | Runs on free/low-cost infrastructure tiers at prototype stage — proves the model before scale spend |
| **Organizational** | Works within the existing government hierarchy — no restructuring required |

---

## 📈 Impact

- **₹6,603 Cr** — increase in costs across two BMRCL metro phases due to delays and incorrect estimates *(CAG Audit Report)*
- **₹186.8 Cr** — additional statutory interest linked to delayed final notification *(CAG Audit Report)*
- Full compensation transparency: every component of the final payout is visible and auditable to all stakeholders

---

## 📂 Project Structure

```
├── src/            # Application source code
├── prisma/         # Database schema & migrations
├── public/         # Static assets
├── DOCS/           # Domain research this app is built from
└── .env.local      # Environment configuration (Supabase project keys)
```

## 🚀 Getting Started

See [`DOCS/`](./DOCS) for full domain research and setup instructions, including manual Supabase configuration (PostGIS extension, database credentials, migrations).

---

## 👥 Team ICARUS

Built for **Smart India Hackathon 2026**

- Bhavesh Khatri
- Himesh Chaudhary
- Devansh Borana
- Akshit Dadhich
- Siya Sharma
- Yash Kumar

---

<div align="center">

### 🇮🇳 From Disputes to Development. A More Prosperous India.

</div>
