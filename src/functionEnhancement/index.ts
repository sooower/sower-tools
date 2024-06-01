import { format } from "node:util";

import ts from "typescript";

import { fs, vscode } from "../shared";
import { extensionCtx } from "../shared/init";
import { toUpperCamelCase } from "../shared/utils";
import CommonUtils from "../shared/utils/commonUtils";

export async function subscribeEnhanceFunction() {
    const enhanceFunction = vscode.workspace.onDidSaveTextDocument(
        async (doc) => {
            try {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor === undefined) {
                    return;
                }

                if (doc !== activeEditor.document) {
                    return;
                }

                validateTsSourFile(activeEditor.document.fileName);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(enhanceFunction);
}

function validateTsSourFile(filePath: string) {
    if (!filePath.endsWith(".ts")) {
        return;
    }

    const sourceFile = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, "utf8"),
        ts.ScriptTarget.ES2015,
        true
    );
    ts.forEachChild(sourceFile, validateFuncParameterTypeName);
}

function validateFuncParameterTypeName(node: ts.Node) {
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
