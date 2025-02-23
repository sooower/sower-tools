import { extensionCtx, logger, vscode } from "@/core";

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
                logger.error("Failed to refresh selected lines.", e);
            }
        })
    );
}
