import { defineModule } from "@/core";

import { breakStatement } from "./modules/breakStatement";
import { classDeclaration } from "./modules/classDeclaration";
import { comment } from "./modules/comment";
import { continueStatement } from "./modules/continueStatement";
import { enumDeclaration } from "./modules/enumDeclaration";
import { functionDeclaration } from "./modules/functionDeclaration";
import { importStatement } from "./modules/importStatement";
import { interfaceDeclaration } from "./modules/interfaceDeclaration";
import { returnStatement } from "./modules/returnStatement";
import { shared } from "./modules/shared";
import { tryStatement } from "./modules/tryStatement";
import { typeDeclaration } from "./modules/typeDeclaration";

export const styleCheck = defineModule([
    shared,
    comment,
    returnStatement,
    classDeclaration,
    typeDeclaration,
    interfaceDeclaration,
    importStatement,
    functionDeclaration,
    continueStatement,
    breakStatement,
    enumDeclaration,
    tryStatement,
]);
