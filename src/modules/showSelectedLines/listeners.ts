import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

import { refreshSelectedLines } from "./utils/selectedLines";
import {
    createAndShowStatusBarItem,
    setSelectedLinesStatusItemText,
} from "./utils/statusBarItems";

export function registerOnDidChangeTextEditorSelectionListener() {
    createAndShowStatusBarItem();

    extensionCtx.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(event => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const [selection] = event.selections;
                if (selection.isEmpty) {
                    setSelectedLinesStatusItemText({
                        totalLines: 0,
                        nonEmptyLines: 0,
                    });

                    return;
                }

                refreshSelectedLines({ editor, selection });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}
