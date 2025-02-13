import dayjs from "dayjs";

import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import { kCommandInsertTimestamp } from "./consts";

export function registerCommandInsertTimestamp() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(kCommandInsertTimestamp, async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                await TextEditorUtils.insertTextAtOffset({
                    editor,
                    offset: editor.document.offsetAt(editor.selection.active),
                    text: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    lineBreak: "",
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}
