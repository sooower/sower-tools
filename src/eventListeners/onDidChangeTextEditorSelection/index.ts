import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

import {
    createAndShowStatusItem,
    setSelectedLinesStatusItemText,
    showSelectedLines,
} from "./showSelectedLines";

export function subscribeOnDidChangeTextEditorSelectionListener() {
    createAndShowStatusItem();

    const listener = vscode.window.onDidChangeTextEditorSelection(event => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }

            const [selection] = event.selections;
            if (selection.isEmpty) {
                return setSelectedLinesStatusItemText();
            }

            showSelectedLines({ editor, selection });
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(`${e}`);
        }
    });

    extensionCtx.subscriptions.push(listener);
}
