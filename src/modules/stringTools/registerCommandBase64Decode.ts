import { vscode } from "@/shared";
import { enableReplaceText, extensionCtx } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import { kCommandBase64Decode } from "./consts";

export function registerCommandBase64Decode() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(kCommandBase64Decode, async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const selectedText = editor.document
                    .getText(editor.selection)
                    .trim();

                await base64Decode({
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

type TBase64DecodeOptions = {
    editor: vscode.TextEditor;
    text: string;
};

async function base64Decode({ editor, text }: TBase64DecodeOptions) {
    if (text === "") {
        return;
    }

    const decodedText = Buffer.from(text, "base64").toString("utf-8");
    enableReplaceText
        ? await TextEditorUtils.replaceTextRangeOffset({
              editor: editor,
              start: editor.document.offsetAt(editor.selection.start),
              end: editor.document.offsetAt(editor.selection.end),
              newText: decodedText,
          })
        : await TextEditorUtils.insertTextAtOffset({
              editor: editor,
              offset: editor.document.offsetAt(editor.selection.end),
              text: decodedText,
          });
}
