import ts from "typescript";

export function findAllImportStatementNodes(
    sourceFile: ts.SourceFile
): ts.ImportDeclaration[] {
    return sourceFile.statements.filter(ts.isImportDeclaration);
}

export function findLastImportStatementNode(
    sourceFile: ts.SourceFile
): ts.ImportDeclaration | undefined {
    return findAllImportStatementNodes(sourceFile).pop();
}
