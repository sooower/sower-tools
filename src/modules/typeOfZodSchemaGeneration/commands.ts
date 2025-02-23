import ts from "typescript";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { prettierFormatFile } from "@/utils/common";
import {
    findTypeDeclarationNode,
    findVariableDeclarationNodeAtOffset,
} from "@/utils/typescript";
import {
    createSourceFileByEditor,
    isTypeScriptFile,
    textEditorUtils,
} from "@/utils/vscode";
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

                    if (!isTypeScriptFile(editor.document)) {
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
                    logger.error("Failed to generate type of zod schema.", e);
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
        newText: await prettierFormatFile(
            createSourceFileByEditor(editor).fileName
        ),
    });
}
