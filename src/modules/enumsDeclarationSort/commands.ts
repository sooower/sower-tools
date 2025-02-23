import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { findTopLevelEnumDeclarationNodes } from "@/utils/typescript";
import { createSourceFileByEditor, isTypeScriptFile } from "@/utils/vscode";

export function registerCommandSortEnumsDeclaration() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.sortEnumsDeclaration`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    if (!isTypeScriptFile(editor.document)) {
                        return;
                    }

                    await vscode.workspace.save(editor.document.uri);

                    await sortEnumsDeclaration(editor);
                } catch (e) {
                    logger.error("Failed to sort enums declaration.", e);
                }
            }
        )
    );
}

/**
 * Sort enum declarations in the file which only contain enum declarations.
 */
async function sortEnumsDeclaration(editor: vscode.TextEditor) {
    const enumNodes = findTopLevelEnumDeclarationNodes(
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
