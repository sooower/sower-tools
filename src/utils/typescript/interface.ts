import ts from "typescript";

export function findAllInterfaceDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): ts.InterfaceDeclaration | undefined => {
        if (!ts.isInterfaceDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        typeDeclarationNodes.push(node);
    };

    const typeDeclarationNodes: ts.InterfaceDeclaration[] = [];
    visit(sourceFile);

    return typeDeclarationNodes;
}
