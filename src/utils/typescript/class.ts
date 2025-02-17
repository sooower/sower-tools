import ts from "typescript";

type TFindClassDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};
export function findClassDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindClassDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.ClassDeclaration | undefined => {
        if (!ts.isClassDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    };

    return visit(sourceFile);
}

export function findAllClassDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): ts.ClassDeclaration | undefined => {
        if (!ts.isClassDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        classDeclarationNodes.push(node);
    };

    const classDeclarationNodes: ts.ClassDeclaration[] = [];
    visit(sourceFile);

    return classDeclarationNodes;
}
