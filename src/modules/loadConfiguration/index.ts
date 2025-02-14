import { reloadConfiguration } from "@/shared/configuration";
import { defineModule } from "@/shared/module";

import { registerOnDidChangeConfigurationListener } from "./registerOnDidChangeConfigurationListener";

export const loadConfiguration = defineModule({
    async onActive() {
        await reloadConfiguration();
        registerOnDidChangeConfigurationListener();
    },
});
