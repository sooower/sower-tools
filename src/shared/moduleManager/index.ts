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

/**
 * Define a module for the extension.
 *
 * @example
 * ```ts
 * export default defineModule({
 *     onActive() {},
 *     onDeactive() {},
 *     onReloadConfiguration() {},
 * });
 * ```
 */
export const defineModule = (module: TModule) => module;

/**
 * Manager for the modules, including activate, deactivate and reload configuration for all modules.
 */
class ModuleManager {
    private modules = new Set<TModule>();

    /**
     * Register a module, which is called when the extension is activated.
     */
    registerModule(module: TModule) {
        this.modules.add(module);
    }

    /**
     * Activate all modules, which is called when the extension is activated.
     */
    async activateModules() {
        await Promise.all([...this.modules].map(module => module.onActive?.()));
    }

    /**
     * Deactivate all modules, which is called when the extension is deactivated.
     */
    async deactivateModules() {
        await Promise.all(
            [...this.modules].map(module => module.onDeactive?.())
        );
    }

    /**
     * Reload configuration for all modules, which is called when extension configuration is reloaded.
     */
    async reloadConfiguration() {
        await Promise.all(
            [...this.modules].map(module => module.onReloadConfiguration?.())
        );
    }
}

export const moduleManager = new ModuleManager();
