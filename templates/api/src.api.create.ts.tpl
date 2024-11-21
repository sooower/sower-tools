import { HttpHandlerReq, HttpHandlerRes } from "@/modules/HttpHandler";
import { FOMORemitError } from "@/modules/ProjectUtils";

export async function {{apiName}}Create(req: HttpHandlerReq, res: HttpHandlerRes) {
    const hint = req.hint;

    try {
        // start your code here
    } catch (e) {
        console.error(hint, `Error while creating {{apiName}}.`, e);
        if (e instanceof FOMORemitError) {
            res.status(e.httpStatusCode).json({
                hint: hint,
                code: e.code,
                message: e.message,
            });
            return;
        }
        throw e;
    }
}
