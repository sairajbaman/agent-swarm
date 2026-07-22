# Example: Coding Task Swarm Run

## User Prompt
"Build a CLI tool that converts markdown files to PDF with syntax highlighting"

## Orchestrator Analysis
- **Type**: Coding (multi-component)
- **Complexity**: Medium-Large (7 agents)
- **Pattern**: [planner + researcher] → [architect] → [coder × 2] → [reviewer] → [integrator]

## Generated Pipeline

```json
{
  "task": "Build a CLI tool that converts markdown files to PDF with syntax highlighting",
  "stages": [
    {
      "name": "research-libraries",
      "role": "swarm-researcher",
      "prompt_template": "Research the best libraries for converting markdown to PDF in Node.js/TypeScript for: {task}. Focus on: markdown parsing libs, PDF generation libs, syntax highlighting libs. Compare at least 3 options for each. Include npm package names and version info."
    },
    {
      "name": "plan-architecture",
      "role": "swarm-planner",
      "prompt_template": "Create a detailed implementation plan for: {task}. Break it into phases: CLI argument parsing, markdown parsing, syntax highlighting, PDF generation. Identify dependencies between steps."
    },
    {
      "name": "design-system",
      "role": "swarm-architect",
      "prompt_template": "Design the architecture for: {task}. Define: module structure, data flow (markdown string → AST → highlighted → PDF), CLI interface (arguments, options, flags), error handling strategy. Use research findings from previous stage.",
      "depends_on": ["research-libraries", "plan-architecture"]
    },
    {
      "name": "implement-core",
      "role": "swarm-coder",
      "prompt_template": "Implement the core conversion pipeline for: {task}. Build: markdown parser integration, syntax highlighter, PDF renderer. Follow the architecture from the design stage. Write complete TypeScript code.",
      "depends_on": ["design-system"]
    },
    {
      "name": "implement-cli",
      "role": "swarm-coder",
      "prompt_template": "Implement the CLI interface for: {task}. Build: argument parsing (input file, output path, options), help text, error messages, progress indicators. Use a CLI framework like commander or yargs.",
      "depends_on": ["design-system"]
    },
    {
      "name": "review-code",
      "role": "swarm-reviewer",
      "prompt_template": "Review all code produced for: {task}. Check: error handling, type safety, edge cases (empty files, invalid markdown, permission errors), performance with large files. Suggest specific fixes.",
      "depends_on": ["implement-core", "implement-cli"]
    },
    {
      "name": "deliver-final",
      "role": "swarm-integrator",
      "prompt_template": "Integrate and deliver the final version of: {task}. Merge the core pipeline and CLI interface. Apply reviewer feedback. Ensure everything works together. Deliver: complete source files, package.json, README with usage examples.",
      "depends_on": ["review-code"]
    }
  ]
}
```

## Execution Flow

```
Time 0s:   [research-libraries] ──┐ (parallel)
           [plan-architecture]  ──┘

Time ~30s: [design-system] starts (both deps complete)

Time ~60s: [implement-core] ──┐ (parallel)
           [implement-cli]  ──┘

Time ~90s: [review-code] starts (both impls complete)

Time ~100s: [deliver-final] starts (review complete)

Time ~110s: Final output delivered to user
```

## Result
User receives: Complete working CLI tool with all source files, package.json, and README — produced by 7 specialized agents in ~2 minutes instead of one agent taking 5+ minutes with less thoroughness.
