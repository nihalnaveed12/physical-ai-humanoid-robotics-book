<!-- Sync Impact Report:
Version change: 1.0.0 → 1.1.0
Modified principles: Technical Accuracy expanded with verification requirements
Added sections: Academic Rigor, Modularity, RAG Compliance principles; Technical Stack section; Quality Standards section
Removed sections: None
Templates requiring updates: ✅ No updates needed to existing templates
Follow-up TODOs: None
-->
# Physical AI & Humanoid Robotics Book with Integrated RAG Chatbot Constitution

## Core Principles

### Technical Accuracy and Source Verification
All technical claims must be verified against official docs, peer-reviewed papers, or authoritative sources; All diagrams, URDFs, and code must be validated in their environments

### Educational Clarity and Accessibility
Content must be clear and accessible to students and developers learning humanoid robotics with structured approach: Concepts → Theory → Setup → Implementation → Code → Exercises

### Reproducibility and Validation (NON-NEGOTIABLE)
All code snippets, ROS 2 examples, and URDF models must run in simulation or real-world setups; TDD approach required for code examples with validation in actual environments

### Academic Rigor and Source Quality
Peer-reviewed sources preferred; minimum 50% of references must be academic papers; At least 5 sources per module with ≥50% peer-reviewed

### Modularity and Consistency
Each module must be self-contained but consistent with overall book goals; Writing and terminology must remain consistent throughout the book

### RAG Compliance and Zero Hallucination
The RAG chatbot must answer strictly from the book content with responses citing module + section; Retrieval queries must be validated; No hallucinations allowed

## Technical Stack and Implementation Standards
Book framework: Docusaurus (React-based static site generator); Frontend deployment: Vercel; Backend (optional for RAG API): Vercel serverless functions or Railway; RAG Chatbot: FastAPI + OpenAI Agents / ChatKit SDK + Neon Serverless Postgres + Qdrant Cloud Free Tier; Authoring: Claude CLI + Spec-Kit Plus; Programming languages: Python (RAG backend, ROS bridging examples), JavaScript/TypeScript (Docusaurus + frontend)

## Quality Standards and Research Approach
Citation format: APA style; Code & content: Markdown with embedded code snippets, diagrams, and references; Quality validation: reproducibility of examples, functional RAG queries, zero plagiarism; Research approach: research-concurrent (gather resources while writing); Module implementation rules: Follow dependency order for topics, Include diagrams and code snippets for all technical sections, Design decisions documented in ADRs when multiple valid approaches exist, Ensure consistency and modularity across all modules

## Governance
Constitution governs all project development; All content must comply with technical accuracy, reproducibility, and RAG compliance standards; Changes require verification against authoritative sources; Design decisions documented in ADRs when multiple valid approaches exist

**Version**: 1.1.0 | **Ratified**: 2025-12-09 | **Last Amended**: 2025-12-09


