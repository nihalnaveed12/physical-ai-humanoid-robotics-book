---
id: 2
title: Update Constitution Tech Stack
stage: constitution
date: 2025-12-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,update,tech-stack,robotics]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

update /sp.constitution

Project: Physical AI & Humanoid Robotics Book with Integrated RAG Chatbot

Core principles:
- Accuracy: all technical claims verified against official docs, peer-reviewed papers, or authoritative sources
- Clarity: content accessible to students and developers learning humanoid robotics
- Reproducibility: code snippets, ROS 2 examples, and URDF models must run in simulation or real-world setups
- Rigor: peer-reviewed sources preferred; minimum 50% of references must be academic papers
- Modularity: each module self-contained but consistent with overall book goals
- RAG compliance: chatbot only answers based on book content; retrieval queries must be validated

Key standards:
- Citation format: APA style
- Code & content: Markdown with embedded code snippets, diagrams, and references
- Quality validation: reproducibility of examples, functional RAG queries, zero plagiarism
- Research approach: research-concurrent (gather resources while writing)

Technical stack:
- Book framework: Docusaurus (React-based static site generator)
- Frontend deployment: Vercel
- Backend (optional for RAG API): Vercel serverless functions or Railway
- RAG Chatbot: FastAPI + OpenAI Agents / ChatKit SDK + Neon Serverless Postgres + Qdrant Cloud Free Tier
- Authoring: Claude CLI + Spec-Kit Plus
- Programming languages: Python (RAG backend, ROS bridging examples), JavaScript/TypeScript (Docusaurus + frontend)

Constraints:
- Word count per module: 2000-3000 words (adjustable for module complexity)
- Minimum sources per module: 5 (≥50% peer-reviewed)
- Output format: Markdown source for book, deployable to GitHub Pages
- Timeline: aligned with hackathon deadlines

Success criteria:
- All module content verified and reproducible
- RAG chatbot answers accurately based on book content
- Deployment succeeds on Vercel/GitHub Pages
- Compliance with APA citations and plagiarism-free

Module implementation rules:
- Follow dependency order for topics (e.g., ROS 2 fundamentals → Python bridging → URDF → simulation)
- Include diagrams and code snippets for all technical sections
- Design decisions documented in ADRs when multiple valid approaches exist
- Ensure consistency and modularity across all modules

## Response snapshot

The constitution for the Physical AI & Humanoid Robotics Book with Integrated RAG Chatbot project has been successfully updated from version 1.0.0 to 1.1.0. The update includes:

- Enhanced Technical Accuracy principle with verification requirements against official docs and peer-reviewed papers
- Added Academic Rigor and Source Quality principle requiring minimum 50% peer-reviewed sources
- Added Modularity and Consistency principle for module design
- Added RAG Compliance and Zero Hallucination principle for the chatbot functionality
- Added Technical Stack section detailing Docusaurus, Vercel, FastAPI, and other technologies
- Added Quality Standards section with APA citation format and research-concurrent approach
- Updated Governance section to include ADR documentation requirements

The constitution now better reflects the technical requirements and implementation approach for the project.

## Outcome

- ✅ Impact: Updated constitution with enhanced technical requirements and stack details
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md from v1.0.0 to v1.1.0
- 🔁 Next prompts: Ready to proceed with project implementation based on updated constitution
- 🧠 Reflection: The updated constitution provides clearer guidance for technical implementation and quality standards

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - All requirements implemented
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementing modules based on updated technical stack requirements