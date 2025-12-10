---
id: 1
title: Create Book Constitution
stage: constitution
date: 2025-12-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution,book,robotics]
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

Create a constitution for a unified project: a book titled Physical AI and Humanoid Robotics plus an integrated RAG chatbot that answers only from the book.

Core Principles

Technical accuracy grounded in authoritative robotics sources.

Clarity for advanced CS/AI learners.

Reproducibility of all setups, simulations, and code.

All factual claims must be traceable to reputable sources.

Consistent pedagogy and terminology.

Module Standards

Module 1: ROS 2

Accurate coverage of Nodes, Topics, Services, Actions, rclpy, and URDF for humanoids.

All examples must run and match ROS 2 behavior.

Module 2: Digital Twin (Gazebo & Unity)

Valid physics, sensors, and environment simulations.

Gazebo and Unity setups must be reproducible.

Module 3: NVIDIA Isaac

Correct Isaac Sim workflows, Isaac ROS VSLAM, and Nav2 path planning.

Synthetic data and navigation examples must run.

Module 4: Vision-Language-Action

Voice-to-action (Whisper) and LLM planning must function correctly.

Capstone: full pipeline from voice command to navigation and manipulation.

Book-Wide Standards

Structure: Concepts → Theory → Setup → Implementation → Code → Exercises.

At least 40 percent factual content from peer-reviewed or authoritative robotics sources.

All diagrams, URDFs, and code validated in their environments.

Chatbot Standards

Answers strictly from the book.

Supports whole-book retrieval and user-selected-text retrieval.

Responses must cite module + section.

Zero hallucination tolerance.

Constraints

8–12 chapters across 4 modules.

All code must run in ROS 2, Gazebo, Unity, and Isaac.

Writing must remain consistent in tone and terminology.

Success Criteria

Accurate, reproducible book content.

Working robotics examples.

Verified factual claims.

Reliable, citation-based RAG chatbot with zero hallucinations.

## Response snapshot

The constitution for the Physical AI and Humanoid Robotics project has been successfully created. The new constitution includes:

- Core Principles: Technical Accuracy and Source Verification, Reproducibility and Consistency, Test-First and Validation (NON-NEGOTIABLE), Educational Clarity for Advanced Learners, Zero Hallucination Tolerance, and Factual Content Standards
- Module Standards and Technology Requirements: covering ROS 2, Digital Twin (Gazebo & Unity), NVIDIA Isaac, and Vision-Language-Action modules
- Development Workflow and Quality Standards: specifying requirements for code execution environments and content structure
- Governance: establishing rules for project development and compliance

The constitution is version 1.0.0, ratified on 2025-12-09, with all requirements from the user implemented.

## Outcome

- ✅ Impact: Created complete project constitution with all specified principles and standards
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md with new constitution
- 🔁 Next prompts: Ready to proceed with project implementation based on this constitution
- 🧠 Reflection: The constitution properly captures all requirements for both the book content and the integrated RAG chatbot system

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - All requirements implemented
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementing the first module based on the constitution