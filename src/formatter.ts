/**
 * C# Gentle Formatter - Formats C# with proper indentation.
 * Preserves blank lines WITH their indentation (adds tabs to empty lines).
 */

import { FormatterConfig } from './config';

enum Context {
    Code,
    String,
    VerbatimString,
    RawString,
    InterpolatedString,
    Char,
    SingleLineComment,
    MultiLineComment
}

export class CSharpFormatter {
    /**
     * Format a C# document.
     */
    public formatDocument(text: string, config: FormatterConfig): string {
        if (!config.enabled) {
            return text;
        }

        const lineEnding = this.detectLineEnding(text);
        const lines = text.split(/\r?\n/);
        const indentChar = this.detectIndentStyle(text);

        let context = Context.Code;
        let depth = 0;
        const result: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Handle blank lines - add indentation to them
            if (trimmed === '') {
                // Add current depth indentation to blank lines
                const blankIndent = indentChar.repeat(depth);
                result.push(blankIndent);
                continue;
            }

            // If we're in a multi-line context, still apply indentation
            // (User wants raw strings indented too, even though it changes the string value)
            if (context === Context.RawString ||
                context === Context.VerbatimString ||
                context === Context.MultiLineComment) {
                const indent = indentChar.repeat(depth);
                result.push(indent + trimmed);
                context = this.getContextAfterLine(line, context);
                continue;
            }

            // Calculate depth for this line
            // If line starts with }, use depth-1 for this line
            let lineDepth = depth;
            if (trimmed.startsWith('}')) {
                lineDepth = Math.max(0, depth - 1);
            }

            // Apply indentation and format
            const indent = indentChar.repeat(lineDepth);
            const formatted = this.formatLineContent(trimmed, config);
            result.push(indent + formatted);

            // Update depth based on braces in this line (only in code portions)
            depth = this.updateDepth(line, depth, context);

            // Update context for next line
            context = this.getContextAfterLine(line, context);
        }

        return result.join(lineEnding);
    }

    /**
     * Get the context state after processing a line.
     */
    private getContextAfterLine(line: string, startContext: Context): Context {
        let ctx = startContext;

        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            const c1 = line[i + 1] || '';
            const c2 = line[i + 2] || '';

            switch (ctx) {
                case Context.Code:
                    if (c === '/' && c1 === '/') return Context.Code; // Single-line comment ends at line end
                    if (c === '/' && c1 === '*') { ctx = Context.MultiLineComment; i++; continue; }
                    if (c === '@' && c1 === '"') { ctx = Context.VerbatimString; i++; continue; }
                    if (c === '$' && c1 === '@' && c2 === '"') { ctx = Context.VerbatimString; i += 2; continue; }
                    if (c === '@' && c1 === '$' && c2 === '"') { ctx = Context.VerbatimString; i += 2; continue; }
                    if (c === '$' && c1 === '"') { ctx = Context.InterpolatedString; i++; continue; }
                    if (c === '"' && c1 === '"' && c2 === '"') { ctx = Context.RawString; i += 2; continue; }
                    if (c === '"') { ctx = Context.String; continue; }
                    if (c === "'") { ctx = Context.Char; continue; }
                    break;

                case Context.String:
                    if (c === '\\') { i++; continue; }
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.VerbatimString:
                    if (c === '"' && c1 === '"') { i++; continue; } // Escaped quote
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.RawString:
                    if (c === '"' && c1 === '"' && c2 === '"') { ctx = Context.Code; i += 2; continue; }
                    break;

                case Context.InterpolatedString:
                    if (c === '\\') { i++; continue; }
                    if (c === '{' && c1 !== '{') {
                        // Skip interpolation expression
                        let braceCount = 1;
                        i++;
                        while (i < line.length && braceCount > 0) {
                            if (line[i] === '{') braceCount++;
                            else if (line[i] === '}') braceCount--;
                            i++;
                        }
                        i--;
                        continue;
                    }
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.Char:
                    if (c === '\\') { i++; continue; }
                    if (c === "'") { ctx = Context.Code; continue; }
                    break;

                case Context.MultiLineComment:
                    if (c === '*' && c1 === '/') { ctx = Context.Code; i++; continue; }
                    break;
            }
        }

        // Single-line comment always ends at line end
        if (ctx === Context.SingleLineComment) return Context.Code;

        return ctx;
    }

    /**
     * Update brace depth based on braces in code portions of the line.
     */
    private updateDepth(line: string, currentDepth: number, startContext: Context): number {
        let depth = currentDepth;
        let ctx = startContext;

        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            const c1 = line[i + 1] || '';
            const c2 = line[i + 2] || '';

            // Track context to know when we're in code
            switch (ctx) {
                case Context.Code:
                    if (c === '/' && c1 === '/') return depth; // Rest is comment
                    if (c === '/' && c1 === '*') { ctx = Context.MultiLineComment; i++; continue; }
                    if (c === '@' && c1 === '"') { ctx = Context.VerbatimString; i++; continue; }
                    if (c === '$' && c1 === '@' && c2 === '"') { ctx = Context.VerbatimString; i += 2; continue; }
                    if (c === '@' && c1 === '$' && c2 === '"') { ctx = Context.VerbatimString; i += 2; continue; }
                    if (c === '$' && c1 === '"') { ctx = Context.InterpolatedString; i++; continue; }
                    if (c === '"' && c1 === '"' && c2 === '"') { ctx = Context.RawString; i += 2; continue; }
                    if (c === '"') { ctx = Context.String; continue; }
                    if (c === "'") { ctx = Context.Char; continue; }
                    // Count braces in code
                    if (c === '{') depth++;
                    if (c === '}') depth = Math.max(0, depth - 1);
                    break;

                case Context.String:
                    if (c === '\\') { i++; continue; }
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.VerbatimString:
                    if (c === '"' && c1 === '"') { i++; continue; }
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.RawString:
                    if (c === '"' && c1 === '"' && c2 === '"') { ctx = Context.Code; i += 2; continue; }
                    break;

                case Context.InterpolatedString:
                    if (c === '\\') { i++; continue; }
                    if (c === '{' && c1 !== '{') {
                        let braceCount = 1;
                        i++;
                        while (i < line.length && braceCount > 0) {
                            if (line[i] === '{') braceCount++;
                            else if (line[i] === '}') braceCount--;
                            i++;
                        }
                        i--;
                        continue;
                    }
                    if (c === '"') { ctx = Context.Code; continue; }
                    break;

                case Context.Char:
                    if (c === '\\') { i++; continue; }
                    if (c === "'") { ctx = Context.Code; continue; }
                    break;

                case Context.MultiLineComment:
                    if (c === '*' && c1 === '/') { ctx = Context.Code; i++; continue; }
                    break;
            }
        }

        return depth;
    }

    /**
     * Format the content of a single line (keyword spacing, operator spacing).
     */
    private formatLineContent(content: string, config: FormatterConfig): string {
        let result = content;

        if (config.keywordSpacing) {
            result = this.applyKeywordSpacing(result);
        }

        if (config.operatorSpacing) {
            result = this.applyOperatorSpacing(result);
        }

        return result;
    }

    /**
     * Add space after control flow keywords.
     */
    private applyKeywordSpacing(code: string): string {
        const keywords = ['if', 'for', 'foreach', 'while', 'switch', 'catch', 'using', 'lock', 'fixed'];
        let result = code;

        for (const kw of keywords) {
            const regex = new RegExp(`\\b(${kw})\\(`, 'g');
            result = result.replace(regex, `$1 (`);
        }

        return result;
    }

    /**
     * Add spaces around operators.
     */
    private applyOperatorSpacing(code: string): string {
        // Skip if line is a comment
        if (code.trimStart().startsWith('//') || code.trimStart().startsWith('/*')) {
            return code;
        }

        let result = code;

        // Fix broken operators first
        result = result.replace(/&\s+&/g, '&&');
        result = result.replace(/\|\s+\|/g, '||');
        result = result.replace(/\?\s+\?/g, '??');
        result = result.replace(/\?\?\s+=/g, '??=');

        // Logical operators
        result = result.replace(/(\w)\s*&&\s*(\w)/g, '$1 && $2');
        result = result.replace(/(\w)\s*\|\|\s*(\w)/g, '$1 || $2');

        // Null coalescing
        result = result.replace(/(\w)\s*\?\?=\s*(\w)/g, '$1 ??= $2');
        result = result.replace(/(\w)\s*\?\?(?!=)\s*(\w)/g, '$1 ?? $2');

        // Comparison operators
        result = result.replace(/(\w)\s*==\s*(\w)/g, '$1 == $2');
        result = result.replace(/(\w)\s*!=\s*(\w)/g, '$1 != $2');
        result = result.replace(/(\w)\s*<=\s*(\w)/g, '$1 <= $2');
        result = result.replace(/(\w)\s*>=\s*(\w)/g, '$1 >= $2');

        // Lambda
        result = result.replace(/(\w)\s*=>\s*(\w)/g, '$1 => $2');
        result = result.replace(/\)\s*=>\s*(\w)/g, ') => $1');
        result = result.replace(/\)\s*=>$/g, ') =>');

        // Compound assignment
        result = result.replace(/(\w)\s*\+=\s*(\w)/g, '$1 += $2');
        result = result.replace(/(\w)\s*-=\s*(\w)/g, '$1 -= $2');
        result = result.replace(/(\w)\s*\*=\s*(\w)/g, '$1 *= $2');
        result = result.replace(/(\w)\s*\/=\s*(\w)/g, '$1 /= $2');

        // Simple assignment (but not ==, !=, <=, >=, +=, etc.)
        result = result.replace(/(\w)(?<![=!<>+\-*\/])=(?![=>])(\w)/g, '$1 = $2');

        // Arithmetic (be careful with generics and unary operators)
        result = result.replace(/(\w)\s*\+\s*(\w)/g, '$1 + $2');
        result = result.replace(/(\))\s*\+\s*(\w)/g, '$1 + $2');
        result = result.replace(/(\w)\s*-\s*(\w)/g, '$1 - $2');
        result = result.replace(/(\))\s*-\s*(\w)/g, '$1 - $2');

        return result;
    }

    private detectLineEnding(text: string): string {
        const crlf = (text.match(/\r\n/g) || []).length;
        const lf = (text.match(/(?<!\r)\n/g) || []).length;
        return crlf >= lf ? '\r\n' : '\n';
    }

    private detectIndentStyle(text: string): string {
        const lines = text.split(/\r?\n/);
        let tabs = 0, spaces = 0;

        for (const line of lines) {
            if (line.startsWith('\t')) tabs++;
            else if (line.startsWith('    ')) spaces++;
        }

        return tabs >= spaces ? '\t' : '    ';
    }
}
