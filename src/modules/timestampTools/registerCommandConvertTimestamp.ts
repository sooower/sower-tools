import { format } from "node:util";

import dayjs from "dayjs";
import { window } from "vscode";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

export function registerCommandConvertTimestamp() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.timestampTool.covertTimestamp`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const selectedText = editor.document
                    .getText(editor.selection)
                    .trim();

                let timestamp: string;
                if (selectedText.match(/^\d+$/)) {
                    timestamp = dayjs
                        .unix(Number(selectedText))
                        .format("YYYY-MM-DD HH:mm:ss");

                    if (timestamp === "Invalid Date") {
                        window.showWarningMessage(
                            format(`Invalid timestamp: "%s".`, selectedText)
                        );

                        return;
                    }
                } else {
                    timestamp = String(dayjs(selectedText).unix());
                    if (timestamp === "NaN") {
                        window.showWarningMessage(
                            format(`Invalid timestamp: "%s".`, selectedText)
                        );

                        return;
                    }
                }
                await TextEditorUtils.replaceTextRangeOffset({
                    editor,
                    start: editor.document.offsetAt(editor.selection.start),
                    end: editor.document.offsetAt(editor.selection.end),
                    newText: timestamp,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
