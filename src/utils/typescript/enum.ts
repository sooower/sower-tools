import ts from "typescript";

export function findEnumDeclarationNodes(sourceFile: ts.SourceFile) {
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
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name?.text === enumName) {
            return node;
        }
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
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    };

    return visit(sourceFile);
}
