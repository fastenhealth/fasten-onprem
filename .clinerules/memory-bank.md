# Cline Rules: Memory Bank Maintenance for Fasten On-Prem

These rules guide the maintenance and evolution of the `/Users/vadim/Projects/fasten-onprem/memory-bank/` and related context files. The goal is to ensure the memory bank remains an accurate, up-to-date, and useful resource for understanding and working on the Fasten On-Prem project.

## Core Principles

1.  **Accuracy:** Information in the memory bank must accurately reflect the current state of the `fasten-onprem` project.
2.  **Relevance:** Focus on information that provides essential context for development, understanding product goals, and technical architecture. Avoid excessive detail that can quickly become outdated or is better found directly in the code.
3.  **Consistency:** Maintain a consistent style and level of detail across all memory bank documents.
4.  **Synchronization:** The memory bank should be updated in conjunction with significant project changes.

## Key Memory Bank Files & Their Purpose

*   **`projectbrief.md`**: High-level project overview, its main components, and purpose.
    *   *Update when*: Core project scope changes, major components are added/removed, or the fundamental purpose evolves.
*   **`productContext.md`**: Product vision, target audience, key features, and user scenarios.
    *   *Update when*: Product strategy shifts, new major features are planned/released, or target audience understanding is refined.
*   **`techContext.md`**: Technologies, languages, frameworks, build tools, and overall technical architecture.
    *   *Update when*: New technologies are adopted, significant architectural changes are made, or core libraries/frameworks are upgraded/replaced.
*   **`systemPatterns.md`**: Key architectural and design patterns used in the project.
    *   *Update when*: New significant patterns are introduced, or existing ones are substantially modified or deprecated.
*   **`activeContext.md`**: Current development focus, ongoing tasks, and immediate project state.
    *   *Update when*: Starting a new major task, summarizing the current state for handoff, or at the beginning of a development sprint/cycle. This file is more dynamic.
*   **`progress.md`**: Overall project maturity, completed milestones, and potential future phases.
    *   *Update when*: Major milestones are achieved, project phases complete, or long-term strategic goals are revised.

## Update Triggers

The memory bank should be reviewed and potentially updated when:

*   **Major Feature Implementation:** After a significant new feature is completed.
*   **Architectural Changes:** When substantial modifications are made to the system's architecture (e.g., introducing a new microservice, changing a core data flow).
*   **Technology Stack Changes:** If new languages, frameworks, or significant libraries are introduced or removed.
*   **Release Cycles:** Before or after major releases, to capture the state of the product.
*   **Onboarding New Team Members:** As part of the onboarding process, review and ensure the memory bank is current.
*   **Periodic Review:** Schedule a periodic review (e.g., quarterly) even if no major changes have occurred, to catch any drift.

## Process for Updates

1.  **Identify Changes:** Determine which aspects of the project have changed since the last memory bank update.
2.  **Locate Relevant Files:** Identify which memory bank files are impacted by these changes.
3.  **Draft Updates:** Modify the content to reflect the new state. Focus on clarity and conciseness.
4.  **Review (if applicable):** For significant updates, have another team member review the changes.
5.  **Commit Changes:** Commit the updated memory bank files to version control along with related code changes if possible, or as a dedicated memory bank update commit.

## Style and Formatting

*   Use Markdown for all memory bank files.
*   Employ clear headings, bullet points, and code blocks where appropriate to enhance readability.
*   Keep language concise and to the point.

By adhering to these rules, the Fasten On-Prem memory bank will serve as a valuable asset for the development team and stakeholders.
