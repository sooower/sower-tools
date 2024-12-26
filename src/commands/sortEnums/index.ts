import { fs, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { findEnumDeclarationNodes } from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";

export function subscribeSortEnums() {
    const command = vscode.commands.registerCommand(
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
    );

    extensionCtx.subscriptions.push(command);
}

async function sortEnums(editor: vscode.TextEditor) {
    const enumNodes = findEnumDeclarationNodes(getSourceFileByEditor(editor));
    const sortedEnumTexts =
        enumNodes
            .sort((a, b) => {
                return a.name.text.localeCompare(b.name.text);
            })
            .map(node => node.getText())
            .join("\n\n") + "\n";

    fs.writeFileSync(editor.document.fileName, sortedEnumTexts);
}
