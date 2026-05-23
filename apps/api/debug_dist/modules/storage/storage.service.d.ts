export declare class StorageService {
    private readonly logger;
    private readonly uploadDir;
    constructor();
    upload(file: Express.Multer.File, subPath: string): Promise<string>;
    getUrl(storagePath: string): string;
    getAbsolutePath(storagePath: string): string;
    delete(storagePath: string): Promise<void>;
    private ensureDir;
}
