import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

/**
 * Find all top level (not nested in other nodes) enum declaration nodes in a source file.
 *
 * @throws Error if non-enum nodes are found
 * @param sourceFile - The source file to search for enum declaration nodes
 * @returns An array of all enum declaration nodes in the source file
 */
export function findTopLevelEnumDeclarationNodes(sourceFile: ts.SourceFile) {
    const enumNodes: ts.EnumDeclaration[] = [];

    sourceFile.forEachChild(node => {
        if (node.getText().trim() === "") {
            return;
        }

        if (!ts.isEnumDeclaration(node)) {
            const { line } = ts.getLineAndCharacterOfPosition(
                sourceFile,
                node.getStart()
            );
            throw new Error(
                `Current file include non-enums node, line at: ${line + 1}.`
            );
        }

        enumNodes.push(node);
    });

    return enumNodes;
}

type TFindEnumDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    enumName: string;
};

export function findEnumDeclarationNode({
    sourceFile,
    enumName,
}: TFindEnumDeclarationNodeOptions) {
    const visit = (node: ts.Node): ts.EnumDeclaration | undefined => {
        if (ts.isEnumDeclaration(node) && node.name?.text === enumName) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}

type TFindEnumDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findEnumDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindEnumDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.EnumDeclaration | undefined => {
        if (ts.isEnumDeclaration(node) && isOffsetWithinNode(node, offset)) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}
