import ts from "typescript";

import { toUpperCamelCase } from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import { format, vscode } from "@/core";
import { extensionCtx } from "@/core/context";
import {
    findFuncOrCtorDeclarationNodeAtOffset,
    findTypeDeclarationNode,
} from "@/utils/typescript";
import { createSourceFileByEditor, textEditorUtils } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { kCommandConvertParametersToOptionsObject } from "./consts";

export function registerCommandConvertParametersToOptionsObject() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            kCommandConvertParametersToOptionsObject,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    if (editor.document.languageId !== "typescript") {
                        return;
                    }

                    const node = findFuncOrCtorDeclarationNodeAtOffset({
                        sourceFile: createSourceFileByEditor(editor),
                        offset: editor.document.offsetAt(
                            editor.selection.active
                        ),
                    });
                    if (node === undefined) {
                        return;
                    }

                    await convertParametersToOptionsObject({
                        editor,
                        node,
                    });
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}

type TConvertParametersToOptionsObjectOptions = {
    editor: vscode.TextEditor;
    node:
        | ts.FunctionDeclaration
        | ts.ArrowFunction
        | ts.MethodDeclaration
        | ts.ConstructorDeclaration;
};

async function convertParametersToOptionsObject({
    editor,
    node,
}: TConvertParametersToOptionsObjectOptions) {
    if (node.parameters.length === 0) {
        return;
    }

    if (!ts.isConstructorDeclaration(node) && node.name === undefined) {
        return;
    }

    // Build new typeDeclarationText

    const typeName = format(
        `T%sOptions`,
        ts.isConstructorDeclaration(node)
            ? CommonUtils.mandatory(node.parent.name).getText() + "Ctor"
            : toUpperCamelCase(CommonUtils.mandatory(node.name).getText())
    );

    let typeDeclarationText: string | undefined;

    // Refactor literal type parameter to named type parameter
    if (node.parameters.length === 1) {
        const [parameter] = node.parameters;
        if (
            parameter.type !== undefined &&
            ts.isTypeLiteralNode(parameter.type)
        ) {
            const typeMembersText = parameter.type.members.map(it => {
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

            await textEditorUtils.replaceTextOfNode({
                editor,
                node: parameter.type,
                newText: typeName,
            });
        }
    } else {
        // Refactor multiple parameters to named type parameter

        const paramNames = node.parameters.map(it =>
            !it.getText().includes("=>") && it.getText().includes("=")
                ? it.getText()
                : it.name.getText()
        );

        const typeMembersText = node.parameters.map(it => {
            const paramName = it.name.getText();
            const paramType = it.type?.getText() ?? mapTsType(it);
            const optional =
                it.questionToken !== undefined || // param is optional
                it.getText().includes("="); //param have default value

            return format(
                `%s%s: %s;`,
                paramName,
                optional ? "?" : "",
                paramType
            );
        });
        const newParamsText = `{ ${paramNames.join(", ")} }: ${typeName}`;

        const firstParam = node.parameters[0];
        const lastParam = node.parameters[node.parameters.length - 1];
        await textEditorUtils.replaceTextRangeOffset({
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

    // Insert new typeDeclarationText

    const sourceFile = createSourceFileByEditor(editor);
    if (
        findTypeDeclarationNode({
            sourceFile,
            typeName,
        }) === undefined &&
        typeDeclarationText !== undefined
    ) {
        await textEditorUtils.insertTextBeforeNode({
            editor,
            sourceFile,
            node:
                ts.isMethodDeclaration(node) ||
                ts.isConstructorDeclaration(node)
                    ? node.parent
                    : node,
            text: typeDeclarationText,
        });
    }
}

function mapTsType(node: ts.Node) {
    const varDefaultValue = node.getText().split("=")[1].trim();

    if (/^[`'"].*[`'"]$/.test(varDefaultValue)) {
        return ETsType.String;
    }

    if (/^\d+$/.test(varDefaultValue)) {
        return ETsType.Number;
    }

    if (/true|false/.test(varDefaultValue)) {
        return ETsType.Boolean;
    }

    return ETsType.Unknown;
}
