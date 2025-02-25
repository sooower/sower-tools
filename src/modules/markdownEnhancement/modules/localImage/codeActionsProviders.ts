import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("markdown", {
            provideCodeActions(document, range, context, token) {
                return context.diagnostics
                    .filter(
                        it =>
                            it.code === `@${extensionName}/no-local-image-link`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Upload to minio storage",
                            vscode.CodeActionKind.QuickFix
                        );
                        codeAction.command = {
                            command: `${extensionName}.markdownEnhancement.localImage.uploadToMinioStorage`,
                            title: "Upload to minio storage",
                            arguments: [document, diagnostic.range],
                        };

                        return codeAction;
                    });
            },
        })
    );
}
