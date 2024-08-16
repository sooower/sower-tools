import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import {
    findTypeDeclarationNode,
    findVariableDeclarationNodeAtOffset,
} from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

export function subscribeGenerateTypeSchema() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateTypeSchema`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                const varNode = findVariableDeclarationNodeAtOffset({
                    sourceFile: getSourceFileByEditor(editor),
                    offset: editor.document.offsetAt(editor.selection.active),
                });
                CommonUtils.assert(
                    varNode !== undefined,
                    `Can not found variable declaration, please check your code.`
                );

                await generateTypeSchema({
                    editor,
                    node: varNode,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

type TGenerateTypeSchemaOptions = {
    editor: vscode.TextEditor;
    node: ts.VariableDeclaration;
};

async function generateTypeSchema({
    editor,
    node,
}: TGenerateTypeSchemaOptions) {
    const schemaName = node.name.getText();
    const typeName = format(
        `T%s`,
        toUpperCamelCase(
            schemaName.endsWith("Schema") ? schemaName.slice(0, -6) : schemaName
        )
    );
    const typeText = format(
        `
            %s type %s = z.infer<typeof %s>;
        `,
        node.parent.parent.getText().startsWith("export") ? "export" : "",
        typeName,
        schemaName
    );

    const sourceFile = getSourceFileByEditor(editor);
    const typeDeclarationNode = findTypeDeclarationNode({
        sourceFile,
        typeName,
    });
    if (typeDeclarationNode !== undefined) {
        await TextEditorUtils.replaceTextOfNode({
            editor,
            sourceFile,
            node: typeDeclarationNode,
            newText: typeText,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile,
            node,
            nodeEndPosPlusOne: true,
            text: typeText,
        });
    }
}
