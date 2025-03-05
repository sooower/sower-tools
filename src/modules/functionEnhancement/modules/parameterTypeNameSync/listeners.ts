import { Node } from "ts-morph";

import { toUpperCamelCase } from "@/modules/shared/modules/configuration/utils";

import { extensionCtx, format, logger, project, vscode } from "@/core";
import {
    buildRangeByNode,
    isNodeInRange,
    isTypeScriptFile,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

export function registerOnDidSaveTextDocumentListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async document => {
            try {
                if (!isTypeScriptFile(document)) {
                    return;
                }

                await syncFunctionParameterTypeName(document);
            } catch (e) {
                logger.error("Failed to sync function parameter type name.", e);
            }
        })
    );
}

/**
 * Sync the type name of the function parameter with the function name.
 *
 * If the function has only one parameter with type name `T${camelCase(functionName)}Options`,
 * then the type name will be synced with the function name when the function is renamed.
 */
async function syncFunctionParameterTypeName(document: vscode.TextDocument) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    const editor = CommonUtils.mandatory(vscode.window.activeTextEditor);

    project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(
            it => Node.isFunctionDeclaration(it) || Node.isMethodDeclaration(it)
        )
        .filter(it => isNodeInRange(document, editor.selection, it)) // Only sync the function in the selection
        .forEach(it => {
            if (it.getName() === undefined || it.getParameters().length !== 1) {
                return;
            }

            const param = CommonUtils.mandatory(it.getParameters().at(0));
            if (Node.isTypeLiteral(param.getTypeNode())) {
                return;
            }

            const paramTypeName = param.getType().getText();
            const expectedParamTypeName = format(
                `T%sOptions`,
                toUpperCamelCase(it.getName() ?? "")
            );
            if (
                !paramTypeName.toLowerCase().includes("option") ||
                paramTypeName === "TOptions" ||
                paramTypeName === expectedParamTypeName
            ) {
                return;
            }

            const typeDeclarationNode = it
                .getSourceFile()
                .getTypeAlias(paramTypeName);
            CommonUtils.assert(
                typeDeclarationNode !== undefined,
                `Cannot find type declaration for ${paramTypeName} in current file.`
            );

            workspaceEdit.replace(
                document.uri,
                buildRangeByNode(document, typeDeclarationNode.getNameNode()),
                expectedParamTypeName
            );
            workspaceEdit.replace(
                document.uri,
                buildRangeByNode(
                    document,
                    CommonUtils.mandatory(param.getTypeNode())
                ),
                expectedParamTypeName
            );
        });

    await vscode.workspace.applyEdit(workspaceEdit);
}
