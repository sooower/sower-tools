import path from "node:path";

import { extensionCtx, extensionName, fs, vscode } from "@/core";
import { buildRangeByOffsets, isMarkdownFile } from "@/utils/vscode";

import { kLocalImageLinkRegex } from "../consts";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticNoInvalidLocalImageFilePath() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "markdown-local-image"
    );
    extensionCtx.subscriptions.push(
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics),
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e?.document !== undefined) {
                updateDiagnostics(e.document);
            }
        })
    );
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (!isMarkdownFile(document)) {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Match all local image links and check if the image file exists

    let match;
    while ((match = kLocalImageLinkRegex.exec(text)) !== null) {
        const [imageLink, imagePath] = match;

        const imageAbsPath = path.resolve(
            path.dirname(document.fileName),
            imagePath
        );
        if (!fs.existsSync(imageAbsPath)) {
            const range = buildRangeByOffsets(
                document,
                match.index + imageLink.indexOf(imagePath),
                match.index + imageLink.indexOf(imagePath) + imagePath.length
            );
            const diagnostic = new vscode.Diagnostic(
                range,
                `Local image file "${imagePath}" not found.`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.code = `@${extensionName}/no-invalid-local-image-file`;

            diagnostics.push(diagnostic);
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
}
