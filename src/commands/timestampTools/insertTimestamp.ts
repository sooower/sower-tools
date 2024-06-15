import dayjs from "dayjs";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { insertTextAtOffset } from "@/shared/utils/vscUtils";

export function subscribeInsertTimestamp() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.timestampTool.insertTimestamp`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                await insertTextAtOffset({
                    editor,
                    offset: editor.document.offsetAt(editor.selection.active),
                    text: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
