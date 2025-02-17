import { vscode } from "@/core";
import { extensionCtx } from "@/core/context";
import { textEditorUtils } from "@/utils/vscode";
import { datetime } from "@utils/datetime";

import { kCommandInsertTimestamp } from "../consts";

export function registerCommandInsertTimestamp() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(kCommandInsertTimestamp, async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                await textEditorUtils.insertTextAtOffset({
                    editor,
                    offset: editor.document.offsetAt(editor.selection.active),
                    text: datetime().format("YYYY-MM-DD HH:mm:ss"), // TODO: update to load timestamp format from configuration
                    lineBreak: "",
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}
