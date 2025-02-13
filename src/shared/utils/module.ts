export type TExtensionLifecycleFunc = () => Promise<void> | void;

/**
 * Module for the extension.
 */
export type TModule = {
    /**
     * Called when the extension is activated.
     */
    onActive: TExtensionLifecycleFunc;

    /**
     * Called when the extension is deactivated.
     */
    onDeactive: TExtensionLifecycleFunc;
};

/**
 * Define a module for the extension.
 *
 * @notice You should call `onActive` and `onDeactive`
 * in the extension's `activate` and `deactivate` functions.
 *
 * @example
 * ```ts
 * export default defineModule({
 *     onActive() {},
 *     onDeactive() {},
 * });
 * ```
 */
export const defineModule = (module: TModule) => module;
