import { format } from "node:util";

import dayjs from "dayjs";
import { window } from "vscode";

import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import { kCommandConvertTimestamp } from "./consts";

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
        })
    );
}
