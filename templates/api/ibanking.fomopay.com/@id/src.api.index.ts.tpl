import {
    HttpHandler,
    HttpHandlerReq,
    HttpHandlerRes,
} from "@/modules/HttpHandler";
import { IBankingError } from "@/modules/ProjectUtils";

export default class HandlerSecapi{{apiNameCapitalPluralize}}$id extends HttpHandler {
    async get(req: HttpHandlerReq, res: HttpHandlerRes) {
        const hint = req.hint;

        try {
            // start your code here
        } catch (e) {
            console.warn(hint, "Error retrieving {{apiName}}.", e);
            if (e instanceof IBankingError) {
                res.status(e.httpStatusCode).json({
                    hint: hint,
                    code: e.code,
                    message: e.message,
                });
                return;
            }
            res.status(500).json({
                hint: hint,
                message: "Internal server error.",
            });
        }
    }

    async patch(req: HttpHandlerReq, res: HttpHandlerRes) {
        const hint = req.hint;

        try {
            // start your code here
        } catch (e) {
            console.warn(hint, "Error updating {{apiName}}.", e);
            if (e instanceof IBankingError) {
                res.status(e.httpStatusCode).json({
                    hint: hint,
                    code: e.code,
                    message: e.message,
                });
                return;
            }
            res.status(500).json({
                hint: hint,
                message: "Internal server error.",
            });
        }
    }

    async delete(req: HttpHandlerReq, res: HttpHandlerRes) {
        const hint = req.hint;

        try {
            // start your code here
        } catch (e) {
            console.warn(hint, "Error deleting {{apiName}}.", e);
            if (e instanceof IBankingError) {
                res.status(e.httpStatusCode).json({
                    hint: hint,
                    code: e.code,
                    message: e.message,
                });
                return;
            }
            res.status(500).json({
                hint: hint,
                message: "Internal server error.",
            });
        }
    }
}
