import { CommonUtils } from "@utils/common";

export type TExtensionLifecycleFunc = () => Promise<void> | void;

/**
 * Module for the extension.
 */
export type TModule = {
    /**
     * Called when the extension is activated.
     */
    onActive?: TExtensionLifecycleFunc;

    /**
     * Called when the extension is deactivated.
     */
    onDeactive?: TExtensionLifecycleFunc;

    /**
     * Called when vscode configuration is reloaded.
     */
    onReloadConfiguration?: TExtensionLifecycleFunc;
};

type TModules = TModule | (TModule | TModules)[];

/**
 * Define module, support define multiple sub modules, nested sub modules or both multiple and nested sub modules.
 *
 * - Define a module
 *
 * @example
 * ```ts
 * export const module = defineModule({
 *     onActive() {},
 *     onDeactive() {},
 *     onReloadConfiguration() {},
 * });
 *```
 *
 * - Define a module with sub modules
 *
 * @example
 * ```ts
 * export const module = defineModule([
 *     // Nested sub modules
 *     defineModule(
 *         defineModule({
 *             onActive() {},
 *         }),
 *     ),
 *     // Multiple sub modules
 *     defineModule([
 *        subModule1,
 *        subModule2,
 *     ]),
 * ]);
 * ```
 */
export const defineModule = <T extends TModules>(module: T): T => module;

/**
 * A module manager which using publish/subscribe pattern, handling events for activate,
 * deactivate and reload configuration.
 */
class ModuleManager {
    readonly modules = new Set<TModule>();

    /**
     * Register modules including their nested sub modules.
     */
    registerModules(modules: TModules) {
        if (CommonUtils.isArray(modules)) {
            modules.forEach(module => this.registerModules(module));
        } else {
            this.modules.add(modules);
        }
    }

    /**
     * Activate all registered modules.
     */
    async activateModules() {
        await Promise.all([...this.modules].map(module => module.onActive?.()));
    }

    /**
     * Deactivate all registered modules.
     */
    async deactivateModules() {
        await Promise.all(
            [...this.modules].map(module => module.onDeactive?.())
        );
    }

    /**
     * Reload configuration for all registered modules.
     */
    async reloadConfiguration() {
        await Promise.all(
            [...this.modules].map(module => module.onReloadConfiguration?.())
        );
    }
}

export const moduleManager = new ModuleManager();
