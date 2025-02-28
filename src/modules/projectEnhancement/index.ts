import { defineModule } from "@/core";

import { projectSnapshot } from "./modules/projectSnapshot";
import { projectsOpen } from "./modules/projectsOpen";

export const projectEnhancement = defineModule([projectsOpen, projectSnapshot]);
