import { subscribeCodeActionProviders } from "./codeActionProvider";
import { subscribeTimestampHoverProvider } from "./timestampHoverProvider";

export function subscribeProviders() {
    subscribeCodeActionProviders();
    subscribeTimestampHoverProvider();
}
