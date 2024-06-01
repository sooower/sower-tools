import { format } from "node:util";

import ts from "typescript";

import { fs, vscode } from "../../shared";
import { extensionCtx } from "../../shared/init";
import { toUpperCamelCase } from "../../shared/utils";
import CommonUtils from "../../shared/utils/commonUtils";

export function subscribeValidateFuncParameterTypeName() {
    const validateFuncParameterTypeName =
        vscode.workspace.onDidSaveTextDocument(async (doc) => {
            try {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor === undefined) {
                    return;
                }

                if (doc !== activeEditor.document) {
                    return;
                }

                const currentFilePath = activeEditor.document.fileName;
                if (!currentFilePath.endsWith(".ts")) {
                    return;
                }

                const sourceFile = ts.createSourceFile(
                    currentFilePath,
                    fs.readFileSync(currentFilePath, "utf8"),
                    ts.ScriptTarget.ES2015,
                    true
                );
                ts.forEachChild(sourceFile, doValidateFuncParameterTypeName);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        });

    extensionCtx.subscriptions.push(validateFuncParameterTypeName);
}

function doValidateFuncParameterTypeName(node: ts.Node) {
    if (!ts.isFunctionDeclaration(node)) {
        return;
    }

    if (node.parameters?.length !== 1) {
        return;
    }

    if (node.name === undefined) {
        return;
    }

    const [parameter] = node.parameters;

    if (
        parameter.type !== undefined &&
        ts.isTypeReferenceNode(parameter.type)
    ) {
        const typeName = parameter.type.typeName.getText();

        if (!typeName.toLowerCase().includes("option")) {
            return;
        }

        CommonUtils.assert(
            typeName === "TOptions" ||
                typeName ===
                    format(`T%sOptions`, toUpperCamelCase(node.name.getText())),
            `Parameter type "%s" is not conform to the form of "TUpperCameCaseFunctionNameOptions".`,
            typeName
        );
    }
}
