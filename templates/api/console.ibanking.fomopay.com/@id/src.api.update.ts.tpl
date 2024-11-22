import accessController from "@/modules/AccessController";
import { HttpHandlerReq, HttpHandlerRes } from "@/modules/HttpHandler";
import { IBankingError } from "@/modules/ProjectUtils";
import {
    kWebAuthenticationPayloadKey,
    TWebAuthenticationPayload,
} from "@/modules/WebAuthentication";

import { EEndpoints } from "@/types/EEndpoints";

const endpoint = EEndpoints.ApiGetAccounts;

export type TOptions = {};

export default async function txnUpdate(
    req: HttpHandlerReq,
    res: HttpHandlerRes,
    options: TOptions
) {
    const { role } = req.data.get<TWebAuthenticationPayload>(
        kWebAuthenticationPayloadKey
    );
    if (!accessController.check(role, endpoint)) {
        throw new IBankingError(403, "-2001", `Permission is not granted.`);
    }
}
