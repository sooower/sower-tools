import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";
import { datetime } from "@utils/datetime";

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
                    text: datetime().format("YYYY-MM-DD HH:mm:ss"),
                    lineBreak: "",
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}
