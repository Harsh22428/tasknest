# TaskNest AI log

## AI tools used

OpenAI Codex helped choose the stack, implement the React app and SQL migration, run verification, and write the project documentation. Codex checked the Supabase and Vercel documentation for the service setup details.

## Main prompts

1. Review the TaskNest PRD and choose a stack that takes little code and fits the deadline.
2. Build an email-based task manager with private task CRUD, a hosted database, and a usable interface.
3. Include a README with local setup and environment variables, and an AI log with prompts and a correction.
4. Explain the UI design and push feature commits as each piece is ready.

## What the AI got wrong

The first task editor disabled the save button during a request but left its fields editable. Any text typed after submitting could disappear when the successful response closed the form. I corrected the generated code by disabling the title, description, and status fields during the save. The form keeps its values and becomes editable again if the request fails.
