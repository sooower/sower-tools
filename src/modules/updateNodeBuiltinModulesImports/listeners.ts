import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditUtils } from "@/shared/utils/vscode/textEditUtils";

import {
    enableUpdateNodeBuiltinModulesImports,
    nodeBuiltinModules,
} from "./configs";

export function registerOnDidSaveTextDocumentListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async doc => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (doc !== editor.document) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                if (enableUpdateNodeBuiltinModulesImports) {
                    await updateNodeBuiltinModulesImportsWithPrefix({ editor });
                }
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}

type TUpdateNodeBuiltinModulesImportsWithPrefixOptions = {
    editor: vscode.TextEditor;
};

/**
 * Update node builtin modules imports with prefix "node:".
 */
export async function updateNodeBuiltinModulesImportsWithPrefix({
    editor,
}: TUpdateNodeBuiltinModulesImportsWithPrefixOptions) {
    const doUpdateNodeBuiltinImports = (node: ts.Node) => {
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
    };

    const edits: vscode.TextEdit[] = [];
    ts.forEachChild(getSourceFileByEditor(editor), doUpdateNodeBuiltinImports);

    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);

        vscode.workspace.save(editor.document.uri);
    }
}
