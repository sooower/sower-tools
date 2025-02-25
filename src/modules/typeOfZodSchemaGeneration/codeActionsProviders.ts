import { VariableDeclaration } from "ts-morph";

import { extensionCtx, format, project, vscode } from "@/core";
import { buildRangeByOffsets } from "@/utils/vscode/range";

import { toUpperCamelCase } from "../shared/modules/configuration/utils";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            async provideCodeActions(document, range, context, token) {
                const sourceFile = project?.getSourceFile(document.uri.fsPath);

                // Find the variable declaration that contains the cursor start position

                const startPos = document.offsetAt(range.start);
                const variableDeclaration = sourceFile
                    ?.getVariableDeclarations()
                    .find(
                        v => v.getStart() <= startPos && v.getEnd() >= startPos
                    );

                if (variableDeclaration === undefined) {
                    return [];
                }

                if (!isZodSchema(variableDeclaration)) {
                    return [];
                }

                // Build the type name and type text

                const schemaName = variableDeclaration.getName();
                const typeName = format(
                    `T%s`,
                    toUpperCamelCase(
                        schemaName.endsWith("Schema")
                            ? schemaName.slice(0, -6)
                            : schemaName
                    )
                );

                const typeText = format(
                    `%stype %s = z.infer<typeof %s>;`,
                    variableDeclaration.isExported() ? "export " : "",
                    typeName,
                    schemaName
                );

                // Replace or insert the type alias declaration

                const typeAliasDeclaration = sourceFile?.getTypeAlias(typeName);
                const codeAction = new vscode.CodeAction(
                    typeAliasDeclaration === undefined
                        ? "Generate type of schema"
                        : "Update type of schema",
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.edit = new vscode.WorkspaceEdit();

                if (typeAliasDeclaration !== undefined) {
                    codeAction.edit.replace(
                        document.uri,
                        buildRangeByOffsets(
                            document,
                            typeAliasDeclaration.getStart(),
                            typeAliasDeclaration.getEnd()
                        ),
                        typeText
                    );
                } else {
                    codeAction.edit.insert(
                        document.uri,
                        document.positionAt(variableDeclaration.getEnd()),
                        `\n\n${typeText}`
                    );
                }

                return [codeAction];
            },
        })
    );
}

function isZodSchema(variableDeclaration: VariableDeclaration): boolean {
    const type = variableDeclaration.getType();

    // Check if the direct symbol source is from zod
    if (
        type
            .getSymbol()
            ?.getDeclarations()
            .some(d =>
                d.getSourceFile().getFilePath().includes("node_modules/zod")
            ) ??
        false
    ) {
        return true;
    }

    // Handle generic parameters (e.g. z.ZodType)
    return type.getTypeArguments().some(t =>
        t
            .getSymbol()
            ?.getDeclarations()
            .some(d =>
                d.getSourceFile().getFilePath().includes("node_modules/zod")
            )
    );
}
