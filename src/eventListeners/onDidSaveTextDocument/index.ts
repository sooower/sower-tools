import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx, reloadConfiguration } from "@/shared/init";
import { updateFuncParameterTypeName } from "./updateFuncParameterTypeName";

export function subscribeOnDidSaveTextDocumentListener() {
    const listener = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        try {
            reloadConfiguration();

            /* Pre handle */

            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (doc !== editor.document) {
                return;
            }

            /* Handling for ts file */

            const currentFilePath = editor.document.fileName;
            if (!currentFilePath.endsWith(".ts")) {
                return;
            }

            const sourceFile = ts.createSourceFile(
                currentFilePath,
                editor.document.getText(),
                ts.ScriptTarget.ES2015,
                true
            );

            updateFuncParameterTypeName({
                editor,
                sourceFile,
            });
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`${e}`);
        }
    });

    extensionCtx.subscriptions.push(listener);
}
