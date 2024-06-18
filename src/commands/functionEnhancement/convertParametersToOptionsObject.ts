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
import {
    getSourceFileByEditor,
    insertTextBeforeNode,
} from "@/shared/utils/vscUtils";

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

                const sourceFile = getSourceFileByEditor(editor);

                const funcNode = findFuncDeclarationNodeAtOffset({
                    sourceFile,
                    offset: editor.document.offsetAt(editor.selection.active),
                });
                if (funcNode === undefined) {
                    return;
                }

                await convertParametersToOptionsObject({
                    editor,
                    sourceFile,
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
    sourceFile: ts.SourceFile;
    node: ts.FunctionDeclaration | ts.ArrowFunction | ts.MethodDeclaration;
};

async function convertParametersToOptionsObject({
    editor,
    sourceFile,
    node,
}: TConvertParametersToOptionsObjectOptions) {
    if (node.name === undefined || node.parameters.length === 0) {
        return;
    }

    // Do not refactor if the function has only one reference(non-primitive) parameter
    if (node.parameters.length === 1) {
        const [firstParameter] = node.parameters;
        if (
            firstParameter.type !== undefined &&
            ts.isTypeReferenceNode(firstParameter.type)
        ) {
            return;
        }
    }

    /* Generate new params */

    const paramNames = node.parameters.map((it) => it.name.getText(sourceFile));

    const paramTypes = node.parameters.map((it) => {
        const paramName = it.name.getText(sourceFile);
        const paramType = it.type?.getText(sourceFile) ?? ETsType.Unknown;
        const optional = it.questionToken !== undefined;

        return format(`%s%s: %s`, paramName, optional ? "?" : "", paramType);
    });
    const typeName = `T${toUpperCamelCase(node.name.getText())}Options`;
    const newParamsText = `{ ${paramNames.join(", ")} }: ${typeName}`;

    /* Update editor text */

    const firstParam = node.parameters[0];
    const lastParam = node.parameters[node.parameters.length - 1];
    const firstParamStartPos = sourceFile.getLineAndCharacterOfPosition(
        firstParam.getStart()
    );
    const lastParamEndPos = sourceFile.getLineAndCharacterOfPosition(
        lastParam.getEnd()
    );
    await editor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    firstParamStartPos.line,
                    firstParamStartPos.character
                ),
                new vscode.Position(
                    lastParamEndPos.line,
                    lastParamEndPos.character
                )
            ),
            newParamsText
        );
    });

    if (
        findTypeDeclarationNode({
            sourceFile,
            typeName,
        }) === undefined
    ) {
        const typeDeclarationText = format(
            `type ${typeName} = {\n\t%s\n};`,
            paramTypes.join(";\n\t")
        );
        await insertTextBeforeNode({
            editor,
            sourceFile,
            node: ts.isMethodDeclaration(node) ? node.parent : node,
            text: typeDeclarationText,
        });
    }
}
