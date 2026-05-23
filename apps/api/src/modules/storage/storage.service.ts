import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Abstracted storage service.
 * Phase 2: Local filesystem storage.
 * Future: Swap to Supabase Storage with zero frontend changes.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor() {
    // uploads/ at the API root (apps/api/uploads/)
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    this.ensureDir(this.uploadDir);
  }

  /**
   * Store a file. Returns the relative path for DB storage.
   */
  async upload(file: Express.Multer.File, subPath: string): Promise<string> {
    const dir = path.join(this.uploadDir, path.dirname(subPath));
    this.ensureDir(dir);

    const filePath = path.join(this.uploadDir, subPath);
    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`Stored file: ${subPath} (${file.size} bytes)`);
    return subPath;
  }

  /**
   * Get a URL to access the file. For local storage, returns a relative API path.
   */
  getUrl(storagePath: string): string {
    return `/v1/files/${storagePath}`;
  }

  /**
   * Get the absolute filesystem path to a stored file.
   */
  getAbsolutePath(storagePath: string): string {
    return path.join(this.uploadDir, storagePath);
  }

  /**
   * Delete a file from storage.
   */
  async delete(storagePath: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`Deleted file: ${storagePath}`);
    }
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
