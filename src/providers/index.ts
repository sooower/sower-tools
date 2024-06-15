import { subscribeTimestampHoverProvider } from "./timestampHoverProvider";
import { subscribeCodeActionProviders } from "./typescriptCodeActionProvider";

export function subscribeProviders() {
    subscribeCodeActionProviders();
    subscribeTimestampHoverProvider();
}
