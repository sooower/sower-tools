import { defineModule } from "@/core/moduleManager";

import { classDeclaration } from "./modules/classDeclaration";
import { comment } from "./modules/comment";
import { functionDeclaration } from "./modules/functionDeclaration";
import { importStatement } from "./modules/importStatement";
import { interfaceDeclaration } from "./modules/interfaceDeclaration";
import { returnStatement } from "./modules/returnStatement";
import { typeDeclaration } from "./modules/typeDeclaration";

export const styleCheck = defineModule([
    comment,
    returnStatement,
    classDeclaration,
    typeDeclaration,
    interfaceDeclaration,
    importStatement,
    functionDeclaration,
]);
