import { extensionCtx, logger, vscode } from "@/core";
import { textEditorUtils } from "@/utils/vscode";
import { datetime } from "@utils/datetime";

import { kCommandConvertTimestamp } from "../consts";

export function registerCommandConvertTimestamp() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(kCommandConvertTimestamp, async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const selectedText = editor.document
                    .getText(editor.selection)
                    .trim();

                let timestamp: string;
                if (selectedText.match(/^\d+$/) !== null) {
                    timestamp = datetime
                        .unix(Number(selectedText))
                        .format("YYYY-MM-DD HH:mm:ss"); // TODO: update to load timestamp format from configuration

                    if (timestamp === "Invalid Date") {
                        logger.warn(`Invalid timestamp: "${selectedText}".`);

                        return;
                    }
                } else {
                    timestamp = String(datetime(selectedText).unix());
                    if (timestamp === "NaN") {
                        logger.warn(`Invalid timestamp: "${selectedText}".`);

                        return;
                    }
                }
                await textEditorUtils.replaceTextRangeOffset({
                    editor,
                    start: editor.document.offsetAt(editor.selection.start),
                    end: editor.document.offsetAt(editor.selection.end),
                    newText: timestamp,
                });
            } catch (e) {
                logger.error("Failed to convert timestamp.", e);
            }
        })
    );
}
