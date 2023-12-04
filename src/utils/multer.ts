
import MulterGoogleCloudStorage from "multer-google-storage";
import multer from "multer";
import { googleStoragePostsBucketName, googleStorageProfileBucketName } from "../config/app.config.js";
import path from "path";
import gcpKeyJson from "../../resources/gcp-key.json";

const defaultStorageConfig = {
    retryOptions: { autoRetry: true },
    projectId: gcpKeyJson.project_id,
    keyFilename: path.join(process.cwd(), 'resources', 'gcp-key.json'),
}

export const postUploadHandler = multer({
    storage: new MulterGoogleCloudStorage({
        ...defaultStorageConfig,
        bucket: googleStoragePostsBucketName,
        filename: (req: any, file: any, cb: any) => {
            const userId = req.user["_id"];

            cb(null, `${userId}/${Date.now()}_post`);
        }
    })
});

export const profileUploadHandler = (props?: { folderName?: string, fileName?: string }) => multer({
    storage: new MulterGoogleCloudStorage({
        ...defaultStorageConfig,
        bucket: googleStorageProfileBucketName,
        filename: (req: any, file: any, cb: any) => {
            const userId = req.user["_id"].toString();

            const fileName = props?.fileName ?? file.originalname;

            if (props?.folderName) {
                cb(null, `${userId}/${props.folderName}/${fileName}`);
            } else {
                cb(null, `${userId}/${fileName}`);
            }
        }
    })
});