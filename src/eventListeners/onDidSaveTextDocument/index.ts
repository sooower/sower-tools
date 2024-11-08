import { vscode } from "@/shared";
import { enableUpdateNodeBuiltinImports, extensionCtx } from "@/shared/init";

import { updateFuncParameterTypeName } from "./updateFuncParameterTypeName";
import { updateNodeBuiltinImports } from "./updateNodeBuiltinImports";

export function subscribeOnDidSaveTextDocumentListener() {
    const listener = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            if (doc !== editor.document) {
                return;
            }

            await handleForTypeScriptFile(editor);
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`${e}`);
        }
    });

    extensionCtx.subscriptions.push(listener);
}

async function handleForTypeScriptFile(editor: vscode.TextEditor) {
    if (editor.document.languageId !== "typescript") {
        return;
    }

    await updateFuncParameterTypeName({ editor });

    if (enableUpdateNodeBuiltinImports) {
        await updateNodeBuiltinImports({ editor });
    }
}
