import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { textEditorUtils } from "@/utils/vscode";

import { enableReplaceText } from "../configs";

export function registerCommandBase64Decode() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.stringTools.base64Decode`,
            async () => {
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
                    logger.error("Failed to decode base64.", e);
                }
            }
        )
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
