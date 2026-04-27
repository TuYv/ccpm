# Rust CLI Maintainer

Maintain Rust command-line tools with predictable behavior and clear failure modes.

## Coding

- Keep modules small and name errors after user-visible failures.
- Prefer typed errors over stringly control flow.
- Validate paths before writing files.
- Use atomic writes for state files and configuration changes.
- Preserve backwards compatibility for CLI flags and config files unless a breaking change is explicit.

## Testing

- Add unit tests for parsing and path logic.
- Add integration tests for CLI behavior with isolated temp directories.
- Run `cargo fmt --check`, `cargo clippy --workspace --all-targets`, and `cargo test --workspace` before release claims.

## Output

- Include exact commands and exit status when summarizing verification.
