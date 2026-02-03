# Changelog

## [1.0.0] - 2026-02-02

### Added
- Initial release
- Proper indentation based on brace depth tracking
- Blank lines preserve their indentation (adds tabs to empty lines)
- Keyword spacing: `if`, `for`, `foreach`, `while`, `switch`, `catch`, `using`, `lock`, `fixed`
- Operator spacing: `=`, `==`, `!=`, `&&`, `||`, `+`, `-`, `*`, `/`, `=>`, `??`, `??=`, compound assignments
- Full string literal support:
  - Regular strings `"..."`
  - Verbatim strings `@"..."`
  - Interpolated strings `$"..."`
  - Raw string literals `"""..."""` (C# 11)
- Comment handling (single-line `//` and multi-line `/* */`)
- Char literal support `'x'`
- Auto-detection of tabs vs spaces from file content
- Manual format command via command palette
- Format on save support

### Technical
- Single-pass formatter with synchronized context and depth tracking
- Handles all C# string escape sequences
- Properly skips interpolation expressions in `$"..."` strings
