Security notes (quick)

- Never commit `.env.local` with real keys.
- Use the included `.githooks/pre-commit` to prevent accidental commits of `.env.local` or API keys.
- Use `.env.local.example` in the repo so teammates know which values to fill.
