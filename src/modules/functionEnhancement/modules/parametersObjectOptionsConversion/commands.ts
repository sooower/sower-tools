import {
    ConstructorDeclaration,
    FunctionDeclaration,
    MethodDeclaration,
    Node,
} from "ts-morph";

import { toUpperCamelCase } from "@/modules/shared/modules/configuration/utils";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { buildRangeByNode, buildRangeByOffsets } from "@/utils/vscode/range";
import { CommonUtils } from "@utils/common";

export function registerCommandConvertParametersToOptionsObject() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.functionEnhancement.convertParametersToOptionsObject`,
            async (
                document: vscode.TextDocument,
                node:
                    | FunctionDeclaration
                    | ConstructorDeclaration
                    | MethodDeclaration
            ) => {
                try {
                    await convertParametersToOptionsObject({
                        document,
                        node,
                    });
                } catch (e) {
                    logger.error(
                        "Failed to convert parameters to options object.",
                        e
                    );
                }
            }
        )
    );
}

async function convertParametersToOptionsObject({
    document,
    node,
}: {
    document: vscode.TextDocument;
    node: FunctionDeclaration | ConstructorDeclaration | MethodDeclaration;
}) {
    const typeName = format(
        `T%sOptions`,
        Node.isConstructorDeclaration(node)
            ? CommonUtils.mandatory(node.getParent().getName()) + "Ctor"
            : toUpperCamelCase(CommonUtils.mandatory(node.getName()))
    );
    let typeDeclarationText: string | undefined;
    const workspaceEdit = new vscode.WorkspaceEdit();

    if (node.getParameters().length === 1) {
        // Refactor it to named type parameter if the function only has one
        // type literal type parameter

        const firstParam = node.getParameters().at(0);
        const typeNode = firstParam?.getTypeNode();
        if (Node.isTypeLiteral(typeNode)) {
            typeDeclarationText = format(
                `type %s = %s;`,
                typeName,
                typeNode.getText()
            );

            workspaceEdit.replace(
                document.uri,
                buildRangeByNode(document, typeNode),
                typeName
            );
        }
    } else {
        // Refactor multiple parameters to named type parameter

        const paramNames = node.getParameters().map(it => it.getName());

        const typeMembersText = node.getParameters().map(it => {
            const paramName = it.getName();
            const paramType = it.getType().getText();
            const optional = it.hasQuestionToken() || Node.isDefaultClause(it);

            return format(
                `%s%s: %s;`,
                paramName,
                optional ? "?" : "",
                paramType
            );
        });

        const newParamsText = `{ ${paramNames.join(", ")} }: ${typeName}`;

        workspaceEdit.replace(
            document.uri,
            buildRangeByOffsets(
                document,
                node.getParameters().at(0)?.getStart() ?? 0,
                node.getParameters().at(-1)?.getEnd() ?? 0
            ),
            newParamsText
        );

        typeDeclarationText = format(
            `type ${typeName} = { %s };`,
            typeMembersText.join(" ")
        );
    }

    const position =
        Node.isMethodDeclaration(node) || Node.isConstructorDeclaration(node)
            ? document.positionAt(node.getParent().getFullStart())
            : document.positionAt(node.getFullStart());

    if (typeDeclarationText !== undefined) {
        workspaceEdit.insert(
            document.uri,
            position,
            `${typeDeclarationText}\n\n`
        );
    }
    await vscode.workspace.applyEdit(workspaceEdit);
}
