import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { ETsType } from "@/shared/types";
import { toUpperCamelCase } from "@/shared/utils";
import {
    findFuncDeclarationNodeAtOffset,
    findTypeDeclarationNode,
} from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

export function subscribeConvertParametersToOptionsObject() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.functionEnhancement.convertParametersToOptionsObject`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                const funcNode = findFuncDeclarationNodeAtOffset({
                    sourceFile: getSourceFileByEditor(editor),
                    offset: editor.document.offsetAt(editor.selection.active),
                });
                if (funcNode === undefined) {
                    return;
                }

                await convertParametersToOptionsObject({
                    editor,
                    node: funcNode,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

type TConvertParametersToOptionsObjectOptions = {
    editor: vscode.TextEditor;
    node: ts.FunctionDeclaration | ts.ArrowFunction | ts.MethodDeclaration;
};

async function convertParametersToOptionsObject({
    editor,
    node,
}: TConvertParametersToOptionsObjectOptions) {
    if (node.name === undefined || node.parameters.length === 0) {
        return;
    }

    const typeName = `T${toUpperCamelCase(node.name.getText())}Options`;
    let typeDeclarationText: string | undefined;

    if (node.parameters.length === 1) {
        const [parameter] = node.parameters;
        if (
            parameter.type !== undefined &&
            ts.isTypeLiteralNode(parameter.type)
        ) {
            const typeMembersText = parameter.type.members.map((it) => {
                if (ts.isPropertySignature(it)) {
                    const memberName = it.name.getText();
                    const memberType = it.type?.getText() ?? ETsType.Unknown;
                    const optional = it.questionToken !== undefined;

                    return format(
                        `%s%s: %s;`,
                        memberName,
                        optional ? "?" : "",
                        memberType
                    );
                }

                return "";
            });

            typeDeclarationText = format(
                `type %s = {\n\t%s\n};`,
                typeName,
                typeMembersText.join("\n\t")
            );

            await TextEditorUtils.replaceTextOfNode({
                editor,
                sourceFile: getSourceFileByEditor(editor),
                node: parameter.type,
                newText: typeName,
            });
        }
    } else {
        /* Generate new params */

        const paramNames = node.parameters.map((it) => it.name.getText());

        const typeMembersText = node.parameters.map((it) => {
            const paramName = it.name.getText();
            const paramType = it.type?.getText() ?? ETsType.Unknown;
            const optional = it.questionToken !== undefined;

            return format(
                `%s%s: %s;`,
                paramName,
                optional ? "?" : "",
                paramType
            );
        });
        const newParamsText = `{ ${paramNames.join(", ")} }: ${typeName}`;

        /* Update editor text */

        const firstParam = node.parameters[0];
        const lastParam = node.parameters[node.parameters.length - 1];
        await TextEditorUtils.replaceTextRangeOffset({
            editor,
            start: firstParam.getStart(),
            end: lastParam.getEnd(),
            newText: newParamsText,
        });

        typeDeclarationText = format(
            `type ${typeName} = {\n\t%s\n};`,
            typeMembersText.join("\n\t")
        );
    }

    const sourceFile = getSourceFileByEditor(editor);
    if (
        findTypeDeclarationNode({
            sourceFile,
            typeName,
        }) === undefined &&
        typeDeclarationText !== undefined
    ) {
        await TextEditorUtils.insertTextBeforeNode({
            editor,
            sourceFile,
            node: ts.isMethodDeclaration(node) ? node.parent : node,
            text: typeDeclarationText,
        });
    }
}
