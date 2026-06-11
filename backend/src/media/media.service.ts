import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
]);

@Injectable()
export class MediaService {
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
    this.publicBaseUrl = config.get<string>(
      'PUBLIC_BASE_URL',
      'http://localhost:3000',
    );
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveUpload(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new Error('不支持的文件类型');
    }
    const ext = extname(file.originalname) || this.extFromMime(file.mimetype);
    const filename = `${randomUUID()}${ext}`;
    const storagePath = join(this.uploadDir, filename);
    const { writeFileSync } = await import('fs');
    writeFileSync(storagePath, file.buffer);
    const publicUrl = `${this.publicBaseUrl}/uploads/${filename}`;
    const asset = await this.prisma.mediaAsset.create({
      data: {
        uploaderId: userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath,
        publicUrl,
      },
    });
    return {
      id: asset.id,
      url: publicUrl,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
    };
  }

  private extFromMime(mime: string) {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
    };
    return map[mime] ?? '.bin';
  }
}
