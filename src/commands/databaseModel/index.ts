import { subscribeGenerateModel } from "./generateModel";
import { subscribeUpdateModel } from "./updateModel";

export function subscribeDatabaseModel() {
    subscribeGenerateModel();
    subscribeUpdateModel();
}
