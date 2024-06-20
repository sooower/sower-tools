import ts from "typescript";

import { vscode } from "@/shared";
import { nodeBuiltinModules } from "@/shared/init";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditUtils } from "@/shared/utils/vscode/textEditUtils";

type TUpdateNodeBuiltinImportsOptions = {
    editor: vscode.TextEditor;
};

export async function updateNodeBuiltinImports({
    editor,
}: TUpdateNodeBuiltinImportsOptions) {
    const edits: vscode.TextEdit[] = [];
    ts.forEachChild(getSourceFileByEditor(editor), doUpdateNodeBuiltinImports);

    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);

        vscode.commands.executeCommand("extension.sortImports");
        vscode.workspace.save(editor.document.uri);
    }

    function doUpdateNodeBuiltinImports(node: ts.Node) {
        if (!ts.isImportDeclaration(node)) {
            return;
        }

        if (!ts.isStringLiteral(node.moduleSpecifier)) {
            return;
        }

        const moduleName = node.moduleSpecifier.text;
        if (
            nodeBuiltinModules.includes(moduleName) &&
            !moduleName.startsWith("node:")
        ) {
            edits.push(
                TextEditUtils.replaceTextRangeOffset({
                    editor: editor,
                    start: node.moduleSpecifier.getStart() + 1,
                    end: node.moduleSpecifier.getEnd() - 1,
                    newText: "node:" + moduleName,
                    endPlusOne: false,
                })
            );
        }
    }
}
