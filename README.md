# C# Gentle Formatter

A VS Code extension that formats C# code with proper indentation while **preserving blank lines with their indentation** (no stripped whitespace on empty lines).

## Why This Exists

Other C# formatters (OmniSharp, CSharpier) strip whitespace from blank lines, causing noisy git diffs when collaborating with teammates who use different editors. This formatter keeps your blank lines indented.

## Features

- **Proper indentation** based on brace depth `{ }`
- **Blank lines keep their indentation** (tabs/spaces preserved)
- **Keyword spacing**: `if(x)` → `if (x)`
- **Operator spacing**: `a=b+c` → `a = b + c`
- **Handles all string types**: regular, verbatim `@""`, interpolated `$""`, raw `"""`
- **Respects comments**: doesn't format inside `//` or `/* */`
- **Detects indent style**: uses tabs or spaces based on your file

## What Gets Formatted

### Indentation
```csharp
// Before (flat)          // After
namespace Foo             namespace Foo
{                         {
public class Bar              public class Bar
{                             {
public void Baz()                 public void Baz()
{                                 {
DoThing();                            DoThing();
}                                 }
}                             }
}                         }
```

### Keyword Spacing
```csharp
if(condition)           → if (condition)
for(int i=0;...)        → for (int i = 0; ...)
while(true)             → while (true)
foreach(var x in y)     → foreach (var x in y)
switch(value)           → switch (value)
catch(Exception)        → catch (Exception)
```

### Operator Spacing
```csharp
a=b                     → a = b
x==y&&z                 → x == y && z
a>0||b<0                → a > 0 || b < 0
x=>x+1                  → x => x + 1
a??b                    → a ?? b
i+=1                    → i += 1
```

### Blank Lines (The Key Feature!)
```csharp
// Other formatters strip the tabs from blank lines
// This formatter KEEPS them:

public void Method()
{
    var x = 1;
    		          ← blank line keeps its indentation!
    var y = 2;
}
```

## Installation

### From VSIX (Local)
1. Download `csharp-gentle-formatter-1.0.0.vsix`
2. In VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select the file

### Set as Default Formatter
Add to your `settings.json`:
```json
"[csharp]": {
    "editor.defaultFormatter": "trentsterling.csharp-gentle-formatter"
}
```

## Usage

- **Format document**: `Shift+Alt+F`
- **Format on save**: Enable `editor.formatOnSave`
- **Command palette**: `Ctrl+Shift+P` → "C# Gentle Format: Format Document"

## Configuration

```json
{
    "csharpGentleFormatter.enabled": true,
    "csharpGentleFormatter.keywordSpacing": true,
    "csharpGentleFormatter.operatorSpacing": true
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Enable/disable the formatter |
| `keywordSpacing` | `true` | Add space after `if`, `for`, `while`, etc. |
| `operatorSpacing` | `true` | Add spaces around `=`, `==`, `&&`, etc. |

## What It Handles

- Regular strings `"..."`
- Verbatim strings `@"..."`
- Interpolated strings `$"..."`
- Raw string literals `"""..."""`
- Single-line comments `//`
- Multi-line comments `/* */`
- Char literals `'x'`
- Generics `List<int>` (no space before `<`)
- Null-conditional `?.` and `?[]` (no spaces)

## License

MIT - Trent Sterling ([tront.xyz](https://tront.xyz))
