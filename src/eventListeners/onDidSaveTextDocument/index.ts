import { vscode } from "@/shared";
import { extensionCtx, reloadConfiguration } from "@/shared/init";
import { getSourceFileByEditor } from "@/shared/utils/vscUtils";
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

            if (editor.document.languageId !== "typescript") {
                return;
            }

            await updateFuncParameterTypeName({
                editor: editor,
                sourceFile: getSourceFileByEditor(editor),
            });
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`${e}`);
        }
    });

    extensionCtx.subscriptions.push(listener);
}
