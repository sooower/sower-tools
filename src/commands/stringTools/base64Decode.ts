import { vscode } from "@/shared";
import { enableReplaceText, extensionCtx, extensionName } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

export function subscribeBase64Decode() {
    const command = vscode.commands.registerCommand(
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
                    editor: editor,
                    text: selectedText,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
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
