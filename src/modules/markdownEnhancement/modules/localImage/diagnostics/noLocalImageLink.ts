import { extensionCtx, extensionName, vscode } from "@/core";
import { isMarkdownFile } from "@/utils/vscode";
import { buildRangeByOffsets } from "@/utils/vscode/range";

import { enableUploadImage } from "../configs/uploadImageEnable";
import { kLocalImageLinkRegex } from "../consts";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticNoLocalImageLink() {
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

async function updateDiagnostics(document: vscode.TextDocument) {
    if (!isMarkdownFile(document)) {
        return;
    }

    if (!enableUploadImage) {
        diagnosticCollection.clear();

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Match all local image links
    let match;
    while ((match = kLocalImageLinkRegex.exec(text)) !== null) {
        const [imageLink, imagePath] = match;
        const range = buildRangeByOffsets(
            document,
            match.index + imageLink.indexOf(imagePath),
            match.index + imageLink.indexOf(imagePath) + imagePath.length
        );
        const diagnostic = new vscode.Diagnostic(
            range,
            `Unrecommended local image path "${imagePath}".`,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/no-local-image-link`;
        diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}
