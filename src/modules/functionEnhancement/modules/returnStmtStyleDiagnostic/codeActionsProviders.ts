import { Position } from "vscode";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new ReturnStmtFixCodeActionProvider()
        )
    );
}

class ReturnStmtFixCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const codeActions: (vscode.CodeAction | vscode.Command)[] = [];

        const diagnostic = context.diagnostics.find(
            it => it.code === `@${extensionName}/blank-line-before-return`
        );
        if (
            diagnostic === undefined ||
            !isCursorInDiagnosticRange(diagnostic, range)
        ) {
            return codeActions;
        }

        const codeAction = new vscode.CodeAction(
            "Add blank line before return statement",
            vscode.CodeActionKind.QuickFix
        );
        codeAction.edit = new vscode.WorkspaceEdit();
        codeAction.edit.insert(
            document.uri,
            new Position(diagnostic.range.start.line, 0),
            "\n"
        );
        codeActions.push(codeAction);

        return codeActions;
    }
}

export function isCursorInDiagnosticRange(
    diagnostic: vscode.Diagnostic,
    range: vscode.Range | vscode.Selection
) {
    return (
        range.start.line >= diagnostic.range.start.line &&
        range.end.line <= diagnostic.range.end.line
    );
}
