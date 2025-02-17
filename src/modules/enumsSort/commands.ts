import { fs, vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findEnumDeclarationNodes } from "@/utils/typescript";
import { createSourceFileByEditor } from "@/utils/vscode";

export function registerCommandSortEnums() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.sortEnums`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    if (editor.document.languageId !== "typescript") {
                        return;
                    }

                    await vscode.workspace.save(editor.document.uri);

                    await sortEnums(editor);
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}

/**
 * Sort enum declarations in the file which only contain enum declarations.
 */
async function sortEnums(editor: vscode.TextEditor) {
    const enumNodes = findEnumDeclarationNodes(
        createSourceFileByEditor(editor)
    );
    const sortedEnumTexts =
        enumNodes
            .sort((a, b) => {
                return a.name.text.localeCompare(b.name.text);
            })
            .map(node => node.getText())
            .join("\n\n") + "\n";

    fs.writeFileSync(editor.document.fileName, sortedEnumTexts);
}
