import { vscode } from "@/core";
import { extensionCtx } from "@/core/context";
import { textEditorUtils } from "@/utils/vscode/textEditor";

import { enableReplaceText } from "../configs";
import { kCommandBase64Decode } from "../consts";

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
                    editor,
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
        ? await textEditorUtils.replaceTextRangeOffset({
              editor,
              start: editor.document.offsetAt(editor.selection.start),
              end: editor.document.offsetAt(editor.selection.end),
              newText: decodedText,
          })
        : await textEditorUtils.insertTextAtOffset({
              editor,
              offset: editor.document.offsetAt(editor.selection.end),
              text: decodedText,
          });
}
