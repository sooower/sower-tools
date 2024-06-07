import ts from "typescript";

import { vscode } from "@/src/shared";
import { extensionCtx, reloadConfiguration } from "@/src/shared/init";
import { updateFuncParameterTypeName } from "./updateFuncParameterTypeName";

export function subscribeOnDidSaveTextDocumentListener() {
    const listener = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        try {
            /* Pre handle */

            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (doc !== editor.document) {
                return;
            }

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

            /* Add actions */

            reloadConfiguration();

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
