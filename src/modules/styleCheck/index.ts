import { defineModule } from "@/core/moduleManager";

import { parseConfigs } from "./configs";
import { breakStatement } from "./modules/breakStatement";
import { classDeclaration } from "./modules/classDeclaration";
import { comment } from "./modules/comment";
import { continueStatement } from "./modules/continueStatement";
import { enumDeclaration } from "./modules/enumDeclaration";
import { functionDeclaration } from "./modules/functionDeclaration";
import { importStatement } from "./modules/importStatement";
import { interfaceDeclaration } from "./modules/interfaceDeclaration";
import { returnStatement } from "./modules/returnStatement";
import { typeDeclaration } from "./modules/typeDeclaration";

export const styleCheck = defineModule([
    {
        onReloadConfiguration() {
            parseConfigs();
        },
    },
    // Add sub modules
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
]);
