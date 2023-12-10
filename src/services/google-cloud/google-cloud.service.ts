import { Storage } from "@google-cloud/storage";
import path from "path";
import { googleCloudKeyFileName } from "../../config/app.config";
import gcpKeyJson from "../../../resources/gcp-key.json";

const storage = new Storage({
    projectId: gcpKeyJson.project_id,
    keyFilename: path.join(process.cwd(), 'resources', googleCloudKeyFileName),
});

export async function uploadFile(bucketName: string, filePath: string, buffer: Buffer) {
    try {
        const bucket = storage.bucket(bucketName);

        const file = bucket.file(filePath);
        await file.save(buffer, {
            resumable: true
        });

        return file;
    } catch (error) {
        console.log("addFile:", error);
        throw error;
    }
}

export async function deleteFile(bucketName: string, fileName: string) {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        const exists = await file.exists()
        if (exists[0]) {
            await file.delete();
        }
    } catch (error) {
        console.log("deleteFile:", error);
        throw error;
    }
}

export async function deleteAllFiles(bucketName: string) {
    try {
        const bucket = storage.bucket(bucketName);

        await bucket.deleteFiles();

    } catch (error) {
        console.log("deleteFile:", error);
        throw error;
    }
}

export async function fileExists(bucketName: string, filePath?: string) {
    if(!filePath) {
        return false;
    }
    
    try {
        const bucket = storage.bucket(bucketName);

        const split = filePath.split("/")
        const fileName = split[split.length - 1];
        const file = bucket.file(fileName);

        const exists = await file.exists();

        return exists[0]
    } catch (error) {
        throw error;
    }
}