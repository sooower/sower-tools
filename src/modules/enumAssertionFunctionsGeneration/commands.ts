import { EnumDeclaration } from "ts-morph";

import {
    extensionCtx,
    extensionName,
    format,
    logger,
    project,
    vscode,
} from "@/core";
import { mapEnumNameWithoutPrefix } from "@/utils/common";
import { buildRangeByNode, formatDocument } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { toLowerCamelCase } from "../shared/modules/configuration/utils";

export function registerCommandGenerateEnumAssertionFunctions() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateEnumAssertionFunctions`,
        async (
            document: vscode.TextDocument,
            enumDeclaration: EnumDeclaration
        ) => {
            try {
                await generateEnumAssertionFunctions({
                    document,
                    enumDeclaration,
                });
            } catch (e) {
                logger.error("Failed to generate enum assertion functions.", e);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

type TGenerateEnumAssertionFunctionsOptions = {
    document: vscode.TextDocument;
    enumDeclaration: EnumDeclaration;
};

async function generateEnumAssertionFunctions({
    document,
    enumDeclaration,
}: TGenerateEnumAssertionFunctionsOptions) {
    const enumName = enumDeclaration.getName();
    const enumNameWithoutPrefix = mapEnumNameWithoutPrefix(enumName);
    const enumMemberNames = enumDeclaration
        .getMembers()
        .map(it => it.getName());
    const valName = toLowerCamelCase(enumNameWithoutPrefix);

    const sourceFile = project?.getSourceFile(document.fileName);

    // Upsert 'assertEXxx' function

    const assertFuncText = format(
        `
            export function assert%s(%s: string): %s {
                switch (%s) {
                    %s {
                        return %s;
                    }
                }
                throw new Error(\`Unexpected %s "\${%s}".\`);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        enumName,
        valName,
        enumMemberNames
            .map(memberName => `case ${enumName}.${memberName}:`)
            .join("\n"),
        valName,
        valName,
        valName
    );
    const assertFuncDeclaration = sourceFile?.getFunction(
        `assert${enumNameWithoutPrefix}`
    );
    const assertFuncWorkspaceEdit = new vscode.WorkspaceEdit();
    if (assertFuncDeclaration === undefined) {
        assertFuncWorkspaceEdit.insert(
            document.uri,
            document.positionAt(enumDeclaration.getEnd()),
            "\n\n" + assertFuncText
        );
    } else {
        assertFuncWorkspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, assertFuncDeclaration),
            assertFuncText
        );
    }
    await vscode.workspace.applyEdit(assertFuncWorkspaceEdit);
    await vscode.workspace.save(document.uri);

    // Upsert 'assertOptionalEXxx' function

    const assertOptionalFuncText = format(
        `
            export function assertOptional%s(%s: string | undefined): %s | undefined {
                if (%s === undefined) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        enumName,
        valName,
        enumNameWithoutPrefix,
        valName
    );
    const funcDeclarationOfAssertOptional = sourceFile?.getFunction(
        `assertOptional${enumNameWithoutPrefix}`
    );
    if (funcDeclarationOfAssertOptional === undefined) {
        const assertFuncDeclaration = sourceFile?.getFunction(
            `assert${enumNameWithoutPrefix}`
        );
        const assertOptionalFuncWorkspaceEdit = new vscode.WorkspaceEdit();
        assertOptionalFuncWorkspaceEdit.insert(
            document.uri,
            document.positionAt(
                CommonUtils.mandatory(assertFuncDeclaration).getEnd()
            ),
            "\n\n" + assertOptionalFuncText
        );
        await vscode.workspace.applyEdit(assertOptionalFuncWorkspaceEdit);
        await vscode.workspace.save(document.uri);
    }

    const assertNullableFuncText = format(
        `
            export function assertNullable%s(%s: string | null): %s | undefined {
                if (%s === null) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        enumName,
        valName,
        enumNameWithoutPrefix,
        valName
    );
    const funcDeclarationOfAssertNullable = sourceFile?.getFunction(
        `assertNullable${enumNameWithoutPrefix}`
    );
    if (funcDeclarationOfAssertNullable === undefined) {
        const assertOptionalFuncDeclaration = sourceFile?.getFunction(
            `assertOptional${enumNameWithoutPrefix}`
        );
        const assertNullableFuncWorkspaceEdit = new vscode.WorkspaceEdit();
        assertNullableFuncWorkspaceEdit.insert(
            document.uri,
            document.positionAt(
                CommonUtils.mandatory(assertOptionalFuncDeclaration).getEnd()
            ),
            "\n\n" + assertNullableFuncText
        );
        await vscode.workspace.applyEdit(assertNullableFuncWorkspaceEdit);
        await vscode.workspace.save(document.uri);
    }

    // Format the document
    await formatDocument(document);
}
