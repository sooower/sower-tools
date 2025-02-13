import { vscode } from "@/shared";
import { enableReplaceText, extensionCtx } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import { kCommandBase64Encode } from "./consts";

export function registerCommandBase64Encode() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(kCommandBase64Encode, async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const selectedText = editor.document
                    .getText(editor.selection)
                    .trim();

                await base64Encode({
                    editor: editor,
                    text: selectedText,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}

type TBase64EncodeOptions = {
    editor: vscode.TextEditor;
    text: string;
};

async function base64Encode({ editor, text }: TBase64EncodeOptions) {
    if (text === "") {
        return;
    }

    const encodedText = Buffer.from(text, "utf-8").toString("base64");
    enableReplaceText
        ? await TextEditorUtils.replaceTextRangeOffset({
              editor: editor,
              start: editor.document.offsetAt(editor.selection.start),
              end: editor.document.offsetAt(editor.selection.end),
              newText: encodedText,
          })
        : await TextEditorUtils.insertTextAtOffset({
              editor: editor,
              offset: editor.document.offsetAt(editor.selection.end),
              text: encodedText,
          });
}
