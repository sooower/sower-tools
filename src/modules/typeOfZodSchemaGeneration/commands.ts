import ts from "typescript";

import { format, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { prettierFormatFile } from "@/shared/utils";
import {
    findTypeDeclarationNode,
    findVariableDeclarationNodeAtOffset,
} from "@/shared/utils/typescript";
import { createSourceFileByEditor } from "@/shared/utils/vscode";
import { textEditorUtils } from "@/shared/utils/vscode/textEditor";
import { CommonUtils } from "@utils/common";

import { toUpperCamelCase } from "../shared/modules/configuration/utils";

export function registerCommandGenerateTypeOfZodSchema() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.generateTypeOfZodSchema`,
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
                        sourceFile: createSourceFileByEditor(editor),
                        offset: editor.document.offsetAt(
                            editor.selection.active
                        ),
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
        )
    );
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
        `%s type %s = z.infer<typeof %s>;`,
        node.parent.parent.getText().startsWith("export") ? "export" : "",
        typeName,
        schemaName
    );

    const sourceFile = createSourceFileByEditor(editor);
    const typeDeclarationNode = findTypeDeclarationNode({
        sourceFile,
        typeName,
    });
    if (typeDeclarationNode !== undefined) {
        await textEditorUtils.replaceTextOfNode({
            editor,
            sourceFile,
            node: typeDeclarationNode,
            newText: typeText,
        });
    } else {
        await textEditorUtils.insertTextAfterNode({
            editor,
            sourceFile,
            node,
            nodeEndPosPlusOne: true,
            text: typeText,
        });
    }

    await vscode.workspace.save(editor.document.uri);

    await textEditorUtils.replaceTextOfSourceFile({
        editor,
        sourceFile: createSourceFileByEditor(editor),
        newText: await prettierFormatFile(
            createSourceFileByEditor(editor).fileName
        ),
    });
}
