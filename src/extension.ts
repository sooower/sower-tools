import { vscode } from "./core";
import { initializeConfigurations } from "./core/configuration";
import { extensionName, initializeContext } from "./core/context";
import { initializeLogger, logger } from "./core/logger";
import { moduleManager } from "./core/moduleManager";
import { initializeASTProject } from "./core/project";
import { modules } from "./modules";

export async function activate(context: vscode.ExtensionContext) {
    try {
        // NOTICE: Initialize context must be called first.
        initializeContext(context);

        initializeLogger();
        logger.trace("Logger initialized.");

        // Register extension modules
        moduleManager.registerModules(modules);
        logger.trace("Modules registered.");

        // NOTICE: Initialize configurations must be called after modules are registered.
        await initializeConfigurations();
        logger.trace("Configurations initialized.");

        // NOTICE: Initialize AST project must be called after configurations are initialized.
        initializeASTProject();
        logger.trace("Project analyser initialized.");

        await moduleManager.activateModules();
        logger.trace("Modules activated.");

        logger.debug(`Extension '${extensionName}' is now active!`);
    } catch (e) {
        logger.error("Failed to activate extension.", e);
    }
}

export async function deactivate() {
    try {
        await moduleManager.deactivateModules();
        logger.trace("Modules deactivated.");

        logger.debug(`Extension '${extensionName}' is now deactive!`);
    } catch (e) {
        logger.error("Failed to deactivate extension.", e);
    }
}
