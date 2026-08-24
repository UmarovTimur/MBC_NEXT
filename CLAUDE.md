# UI conventions

- Never use fully rounded (pill/circle) buttons — no `rounded-full` on buttons.
- Never create a new UI component ad hoc inside an app. Any new UI component must first be added to `packages/ui` (see `packages/ui/src/ui/`), and where possible sourced/imported from shadcn rather than hand-rolled. Apps should import shared components from `packages/ui`.
