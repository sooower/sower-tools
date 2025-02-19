import ts from "typescript";

export function findAllTopLevelStatements(
    sourceFile: ts.SourceFile
): ts.Statement[] {
    return sourceFile.statements.filter(ts.isStatement);
}
