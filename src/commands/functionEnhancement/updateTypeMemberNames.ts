import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { findAllTypeDeclarationNodes } from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditUtils } from "@/shared/utils/vscode/textEditUtils";
import { CommonUtils } from "@utils/common";

export function subscribeUpdateTypeMemberNames() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.functionEnhancement.updateTypeMemberNames`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                await updateTypeMemberNames({ editor });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

type TUpdateTypeMemberNamesOptions = {
    editor: vscode.TextEditor;
};

async function updateTypeMemberNames({
    editor,
}: TUpdateTypeMemberNamesOptions) {
    const edits: vscode.TextEdit[] = [];
    const sourceFile = getSourceFileByEditor(editor);

    const typeDeclarationNodes = findAllTypeDeclarationNodes(sourceFile);

    typeDeclarationNodes
        .filter(it => it.name.text.endsWith("Options"))
        .forEach(node => {
            const memberMap = getTypeMemberNameMap(node);
            ts.forEachChild(sourceFile, findFunctionParameters);

            function findFunctionParameters(node: ts.Node) {
                if (
                    !ts.isFunctionDeclaration(node) &&
                    !ts.isMethodDeclaration(node) &&
                    !ts.isArrowFunction(node) &&
                    !ts.isFunctionExpression(node)
                ) {
                    return;
                }

                node.parameters.forEach(parameter => {
                    if (
                        parameter.type === undefined ||
                        !ts.isTypeReferenceNode(parameter.type)
                    ) {
                        return;
                    }

                    const parameterTypeName = parameter.type.typeName.getText();
                    if (memberMap.has(parameterTypeName)) {
                        const newParamsText = format(
                            `{ %s }`,
                            CommonUtils.mandatory(
                                memberMap.get(parameterTypeName)
                            ).join(", ")
                        );
                        edits.push(
                            TextEditUtils.replaceTextOfNode({
                                editor,
                                node: parameter.name,
                                newText: newParamsText,
                            })
                        );
                    }
                });

                ts.forEachChild(node, findFunctionParameters);
            }
        });

    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);
    }
}

function getTypeMemberNameMap(node: ts.Node) {
    const memberMap = new Map<string, string[]>();

    if (!ts.isTypeAliasDeclaration(node)) {
        return memberMap;
    }

    if (!ts.isTypeLiteralNode(node.type)) {
        return memberMap;
    }

    node.type.members.forEach(m => {
        if (ts.isPropertySignature(m) && ts.isIdentifier(m.name)) {
            const typeName = node.name.getText();
            if (memberMap.has(typeName)) {
                CommonUtils.mandatory(memberMap.get(typeName)).push(
                    m.name.text
                );
            } else {
                memberMap.set(typeName, [m.name.text]);
            }
        }
    });

    return memberMap;
}
