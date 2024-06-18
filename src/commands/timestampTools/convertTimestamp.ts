import { format } from "node:util";

import dayjs from "dayjs";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import CommonUtils from "@/shared/utils/commonUtils";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

export function subscribeConvertTimestamp() {
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

                    CommonUtils.assert(
                        timestamp !== "Invalid Date",
                        `Invalid timestamp: "%s".`,
                        selectedText
                    );
                } else {
                    timestamp = String(dayjs(selectedText).unix());
                    CommonUtils.assert(
                        timestamp !== "NaN",
                        `Invalid timestamp: "%s".`,
                        selectedText
                    );
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
