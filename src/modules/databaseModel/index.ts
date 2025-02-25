import { defineModule } from "@/core";

import { generateModel } from "./modules/generateModel";
import { shared } from "./modules/shared";
import { updateModel } from "./modules/updateModel";

export const databaseModel = defineModule([shared, generateModel, updateModel]);
