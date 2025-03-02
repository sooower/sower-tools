import { Node, TypeAliasDeclaration } from "ts-morph";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { buildRangeByNode } from "@/utils/vscode/range";
import { CommonUtils } from "@utils/common";

export function registerCommandSyncTypeMembers() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.functionEnhancement.syncParameterTypeMembers`,
            async (
                document: vscode.TextDocument,
                node: TypeAliasDeclaration
            ) => {
                try {
                    await syncParameterTypeMembers({ document, node });
                } catch (e) {
                    logger.error("Failed to sync parameter type members.", e);
                }
            }
        )
    );
}

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
 *     age, // The `age` will be removed to sync with the `TOptions` type.
 * }: TOptions) {
 *     console.log(name);
 *     console.log(age);
 * }
 * ```
 */
async function syncParameterTypeMembers({
    document,
    node,
}: {
    document: vscode.TextDocument;
    node: TypeAliasDeclaration;
}) {
    const funcOrMethodOrCtorDeclarationContainsOneOptionsTypeParameter = node
        .getSourceFile()
        .getDescendants()
        .filter(
            it =>
                Node.isFunctionDeclaration(it) ||
                Node.isConstructorDeclaration(it) ||
                Node.isMethodDeclaration(it)
        )
        .filter(
            it =>
                it.getParameters().length === 1 &&
                it.getParameters().at(0)?.getType().getText() === node.getName()
        );

    const workspaceEdit = new vscode.WorkspaceEdit();
    const propertyNames = node
        .getType()
        .getProperties()
        .map(it => it.getName());
    funcOrMethodOrCtorDeclarationContainsOneOptionsTypeParameter.forEach(it => {
        const firstParamNameNode = CommonUtils.mandatory(
            it.getParameters().at(0)?.getNameNode()
        );
        const replaceRange = buildRangeByNode(document, firstParamNameNode);
        const newParamsText = format(`{ %s }`, propertyNames.join(", "));
        workspaceEdit.replace(document.uri, replaceRange, newParamsText);
    });
    await vscode.workspace.applyEdit(workspaceEdit);
}
