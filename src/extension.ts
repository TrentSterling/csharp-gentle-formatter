import * as vscode from 'vscode';
import { CSharpFormatter } from './formatter';
import { getConfig } from './config';

let formatter: CSharpFormatter;

export function activate(context: vscode.ExtensionContext) {
    formatter = new CSharpFormatter();

    // Register as a document formatting provider for C#
    const documentFormatter = vscode.languages.registerDocumentFormattingEditProvider('csharp', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const config = getConfig();
            if (!config.enabled) {
                return [];
            }

            const text = document.getText();
            const formatted = formatter.formatDocument(text, config);

            if (text === formatted) {
                return [];
            }

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );

            return [vscode.TextEdit.replace(fullRange, formatted)];
        }
    });

    // Register manual format command
    const formatCommand = vscode.commands.registerCommand('csharpGentleFormatter.formatDocument', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor');
            return;
        }

        if (editor.document.languageId !== 'csharp') {
            vscode.window.showWarningMessage('C# Gentle Formatter only works with C# files');
            return;
        }

        const config = getConfig();
        const text = editor.document.getText();
        const formatted = formatter.formatDocument(text, config);

        if (text === formatted) {
            vscode.window.showInformationMessage('Document already formatted');
            return;
        }

        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
        );

        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, formatted);
        });

        vscode.window.showInformationMessage('Document formatted');
    });

    context.subscriptions.push(documentFormatter, formatCommand);

    console.log('C# Gentle Formatter is now active');
}

export function deactivate() {
    // Cleanup if needed
}
