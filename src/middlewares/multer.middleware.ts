import { RequestHandler } from "express";
import multer, { Field } from "multer";

export const multerUploadMiddleware = (
    multer: multer.Multer,    
    type: "single" | "fields" | "array" | "any" | "none",
    fields: Field[]): RequestHandler => {
    return (req, res, next) => {
        let upload = multer.any();

        switch (type) {
            case "single":
                upload = multer.single(fields[0].name);
                break;
            case "fields":
                upload = multer.fields(fields);
                break;
            case "array":
                upload = multer.array(fields[0].name, fields[0].maxCount);
                break;
            case "none":
                upload = multer.none();
        }

        upload(req, res, (err) => {
            next();

            if (err) {
                console.log("multerUploadMiddleware:", err)
                return err;
            }
        });
    }
}