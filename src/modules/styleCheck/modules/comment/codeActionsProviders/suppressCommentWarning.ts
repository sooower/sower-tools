import * as vscode from "vscode";

import { extensionName } from "@/core";
import { buildRangeByLineIndex } from "@/utils/vscode";

import { detectCommentKind, ECommentKind } from "../../shared/utils";
import { skipCheckCharacter } from "../configs";

export function registerCodeActionsProviderSuppressCommentWarning() {
    vscode.languages.registerCodeActionsProvider("typescript", {
        provideCodeActions(document, range, context, token) {
            return context.diagnostics
                .filter(
                    d =>
                        d.code === `@${extensionName}/blank-line-before-comment`
                )
                .map(diagnostic => {
                    const codeAction = new vscode.CodeAction(
                        "Suppress the comment warning",
                        vscode.CodeActionKind.QuickFix
                    );

                    const line = document.lineAt(diagnostic.range.start.line);
                    const lineText = line.text.trimStart();

                    // Patch the comment to skip check (insert a skip check character into the comment)
                    let newLineText = lineText;
                    switch (detectCommentKind(lineText)) {
                        case ECommentKind.SingleLine:
                            newLineText = lineText.replace(
                                ECommentKind.SingleLine,
                                `${ECommentKind.SingleLine}${skipCheckCharacter}`
                            );
                            break;
                        case ECommentKind.MultiLineStart:
                            newLineText = lineText.replace(
                                ECommentKind.MultiLineStart,
                                `${ECommentKind.MultiLineStart}${skipCheckCharacter}`
                            );
                            break;
                        case ECommentKind.DocCommentStart:
                            newLineText = lineText.replace(
                                ECommentKind.DocCommentStart,
                                `${ECommentKind.DocCommentStart}${skipCheckCharacter}`
                            );
                            break;
                        default:
                            break;
                    }

                    codeAction.edit = new vscode.WorkspaceEdit();
                    codeAction.edit.replace(
                        document.uri,
                        buildRangeByLineIndex(document, line.lineNumber),
                        newLineText
                    );

                    return codeAction;
                });
        },
    });
}
