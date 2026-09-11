# Working on Fixauto

- The root agent is the planner, orchestrator, and final decision-maker.
- Delegate independent tasks proactively when parallel work improves speed or quality.
- For subagents, use gpt-5.6-luna, max reasoning, when available; report capability limitations honestly.
- The root agent must review, reconcile, and integrate every subagent result.
- Do not delegate small, tightly coupled, or sequential tasks.
- Explain decisions in plain language for a student following Vibies sessions 1–10.
- Grilling Q1–Q87 and shared-understanding confirmation are complete. When the user says “continue fixauto grill me”, read `docs/GRILL-ME.md` and its current review point; reopen only new questions or paid-launch preparation. Use the grilling skill if relevant.
- Read `docs/PLAN.md` for confirmed scope; historical interview recommendations are superseded by later accepted answers. Keep accepted decisions, implementation proposals and unverified external facts distinct. Confirmation does not prove insurance, partner agreements or demand exists.
- For scope and implementation planning, read `docs/PRODUCT.md`, `docs/MVP.md`, `docs/ROADMAP.md`, and `docs/DECISIONS.md`. For data or authorization work, also read `CONTEXT.md`, `docs/DATA-MODEL.md`, and `docs/OWNERSHIP.md`.
- Update the checkpoint and relevant decisions after interview rounds so the next session can resume without repeating settled questions.
- Follow the class workflow for future app implementation: clear issue and acceptance criteria, plan and Skeptic review, feature branch, code, build, Preview proof, reviewed PR, Production verification. Scope confirmation is already recorded; the current documentation/graph request is not a request to implement or deploy the service app.
- Preserve existing user work and keep secrets out of Git. Document changes are not permission to deploy, spend money, contact customers, or make operational commitments.
