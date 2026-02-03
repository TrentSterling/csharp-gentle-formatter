import * as vscode from 'vscode';

export interface FormatterConfig {
    enabled: boolean;
    braceStyle: 'allman' | 'kr';
    operatorSpacing: boolean;
    keywordSpacing: boolean;
}

export function getConfig(): FormatterConfig {
    const config = vscode.workspace.getConfiguration('csharpGentleFormatter');
    return {
        enabled: config.get<boolean>('enabled', true),
        braceStyle: config.get<'allman' | 'kr'>('braceStyle', 'allman'),
        operatorSpacing: config.get<boolean>('operatorSpacing', true),
        keywordSpacing: config.get<boolean>('keywordSpacing', true)
    };
}
