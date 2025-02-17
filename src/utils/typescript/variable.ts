import ts from "typescript";

type TFindVariableDeclarationNodeOptions = {
    sourceFile: ts.Node;
    varName: string;
};

export function findVariableDeclarationNode({
    sourceFile,
    varName,
}: TFindVariableDeclarationNodeOptions) {
    const visit = (node: ts.Node): ts.VariableDeclaration | undefined => {
        if (!ts.isVariableDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name.getText() === varName) {
            return node;
        }
    };

    return visit(sourceFile);
}

type TFindVariableDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findVariableDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindVariableDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.VariableDeclaration | undefined => {
        if (!ts.isVariableDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    };

    return visit(sourceFile);
}
