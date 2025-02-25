import ts from "typescript";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { findAllTypeDeclarationNodes } from "@/utils/typescript";
import {
    createSourceFileByEditor,
    isMarkdownFile,
    textEditUtils,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

export function registerCommandSyncTypeMembers() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.functionEnhancement.syncParameterTypeMembers`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    if (!isMarkdownFile(editor.document)) {
                        return;
                    }

                    await syncParameterTypeMembers({ editor });
                } catch (e) {
                    logger.error("Failed to sync parameter type members.", e);
                }
            }
        )
    );
}

type TSyncParameterTypeMembersOptions = {
    editor: vscode.TextEditor;
};

/**
 * Sync all the members of the type to all places in the opened editor that reference the type.
 *
 * If the function has only one unstructured object type parameter, and the type name of the
 * parameter is ends with "Options", then the function parameters will be synced with the type
 * members after executing this command.
 *
 * @example
 * ```ts
 * type TOptions = {
 *     name: string;
 *     // Assume the `age` has been removed. If execute function `parameterTypeMembersSync`, the `age`
 *     // will be removed from all the function parameters that reference the `TOptions` type.
 *     age: number;
 * }
 *
 * function doSomething({
 *     name,
 *     age, // The `age` will be remove
 * }: TOptions) {
 *     console.log(name);
 *     console.log(age);
 * }
 * ```
 */
async function syncParameterTypeMembers({
    editor,
}: TSyncParameterTypeMembersOptions) {
    const edits: vscode.TextEdit[] = [];
    const sourceFile = createSourceFileByEditor(editor);

    const typeDeclarationNodes = findAllTypeDeclarationNodes(sourceFile);

    typeDeclarationNodes
        .filter(it => it.name.text.endsWith("Options"))
        .forEach(node => {
            const findFunctionParameters = (node: ts.Node) => {
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
                            textEditUtils.replaceTextOfNode({
                                editor,
                                node: parameter.name,
                                newText: newParamsText,
                            })
                        );
                    }
                });

                ts.forEachChild(node, findFunctionParameters);
            };

            const memberMap = getTypeMemberNameMap(node);
            ts.forEachChild(sourceFile, findFunctionParameters);
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
