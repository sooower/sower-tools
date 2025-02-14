import path from "node:path";
import { format } from "node:util";

import { Client } from "minio";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { CommonUtils } from "@utils/common";

import { kLocalImageLinkRegex } from "../consts";
import { markdownImageUploadConfig } from "../parseConfigs/parseMarkdownImageUploadConfigFilePath";
import { enableMarkdownImageUpload } from "../parseConfigs/parseMarkdownImageUploadEnable";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticNoLocalImageLink() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("markdown-minio");
    extensionCtx.subscriptions.push(diagnosticCollection);

    // Register diagnostic update trigger
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(appendDiagnostics)
    );
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(appendDiagnostics)
    );
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e =>
            appendDiagnostics(e.document)
        )
    );

    // Register upload image to minio storage command
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.markdownImageUpload.uploadImageToMinioStorage`,
            uploadImageToMinioStorage
        )
    );

    // Register code action provider
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "markdown",
            new UploadImageActionProvider(diagnosticCollection),
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        )
    );
}

async function appendDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "markdown") {
        return;
    }

    if (!enableMarkdownImageUpload) {
        diagnosticCollection.clear();

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Match all local image links
    let match;
    while ((match = kLocalImageLinkRegex.exec(text)) !== null) {
        const [imageLink, imagePath] = match;
        const imagePathStartPos = document.positionAt(
            match.index + imageLink.indexOf(imagePath)
        );
        const imagePathEndPos = document.positionAt(
            match.index + imageLink.indexOf(imagePath) + imagePath.length
        );
        const imagePathRange = new vscode.Range(
            imagePathStartPos,
            imagePathEndPos
        );

        const diagnostic = new vscode.Diagnostic(
            imagePathRange,
            `Unrecommended local image path "${imagePath}".`,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/no-local-image-link`;
        diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

async function uploadImageToMinioStorage(
    document: vscode.TextDocument,
    range: vscode.Range
) {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Uploading image to minio storage",
            cancellable: true,
        },
        async (progress, token) => {
            try {
                const { endpoint, useSSL, accessKey, secretKey, bucketName } =
                    markdownImageUploadConfig;

                const imageAbsPath = path.resolve(
                    path.dirname(document.uri.fsPath),
                    document.getText(range)
                );

                CommonUtils.assert(
                    /^.+\.(jpeg|jpg|png|gif|svg|webp)$/.test(imageAbsPath),
                    `Unexpected image file extension "${imageAbsPath}".`
                );

                // Upload file

                const minioClient = new Client({
                    endPoint: endpoint,
                    useSSL,
                    accessKey,
                    secretKey,
                });

                const exists = await minioClient.bucketExists(bucketName);
                if (!exists) {
                    throw new Error(`Bucket "${bucketName}" not found.`);
                }

                const objectName = `${Date.now()}${path.extname(imageAbsPath)}`;
                await minioClient.fPutObject(
                    bucketName,
                    objectName,
                    imageAbsPath,
                    {
                        contentType: "application/octet-stream",
                    }
                );

                // Generate remote image link

                const remoteImageLink = format(
                    "%s://%s/%s/%s",
                    useSSL ? "https" : "http",
                    endpoint,
                    bucketName,
                    objectName
                );

                // Replace document content

                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, range, remoteImageLink);
                await vscode.workspace.applyEdit(edit);

                vscode.window.showInformationMessage("Uploaded successfully!");
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Upload failed: ${(error as Error).message}`
                );
            }
        }
    );
}

class UploadImageActionProvider implements vscode.CodeActionProvider {
    constructor(private diagnosticCollection: vscode.DiagnosticCollection) {}

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] {
        const diagnostic = this.getLocalImageDiagnostic(document, range);
        if (diagnostic === undefined) {
            return [];
        }

        const action = new vscode.CodeAction(
            "Upload to minio storage",
            vscode.CodeActionKind.QuickFix
        );
        action.diagnostics = [diagnostic];
        action.command = {
            command: `${extensionName}.markdownImageUpload.uploadToMinioStorage`,
            title: "Upload to minio storage",
            arguments: [document, diagnostic.range],
        };

        return [action];
    }

    private getLocalImageDiagnostic(
        document: vscode.TextDocument,
        range: vscode.Range
    ) {
        return this.diagnosticCollection
            .get(document.uri)
            ?.find(
                d =>
                    d.range.start.isBeforeOrEqual(range.start) &&
                    d.range.end.isAfterOrEqual(range.end)
            );
    }
}
