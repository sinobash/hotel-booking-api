import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaFile } from './entities/media-file.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { generateUUID } from '@common/utils/crypt.helper';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { ImageFileDTO } from './dto/upload-file.dto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ONE_DAY_EXPIRATION_MS } from '@common/constants/decorator.constants';
import { S3RequestPresigner, getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parseUrl } from '@aws-sdk/url-parser';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { formatUrl } from '@aws-sdk/util-format-url';
import { Hash } from '@smithy/hash-node';
import AppError from '@common/errors/app.error';

@Injectable()
export class FilesService {
    private readonly className: string = 'file';
    private readonly _s3: S3Client;
    private readonly _bucketName: string;

    constructor(
        @InjectRepository(MediaFile)
        private mediaFileRepository: Repository<MediaFile>,
        private readonly configService: ConfigService,
    ) {
        this._bucketName = this.configService.get('file.awsDefaultS3Bucket');
        this._s3 = new S3Client({
            credentials: {
                accessKeyId: this.configService.get('file.awsAccessKeyId'),
                secretAccessKey: this.configService.get('file.awsSecretAccessKey'),
            },
            region: this.configService.get('file.awsS3Region'),
            sha256: Hash.bind(null, 'sha256'),
        });
    }

    getS3() {
        return this._s3;
    }

    getBucketName() {
        return this._bucketName;
    }

    async createPresignedUrlByUrl(url: string): Promise<string> {
        const parsedUrl = parseUrl(url);
        const presigner = new S3RequestPresigner({
            ...this._s3.config,
        });
        const signedUrlObject = await presigner.presign(new HttpRequest(parsedUrl), {
            expiresIn: ONE_DAY_EXPIRATION_MS,
        });
        return formatUrl(signedUrlObject);
    }

    async createPresignedUrlByKey(key: string, action = 'upload'): Promise<string> {
        let objCommand = null;
        if (action === 'download') {
            objCommand = new GetObjectCommand({
                Bucket: this._bucketName,
                Key: key,
            });
        } else {
            objCommand = new PutObjectCommand({
                Bucket: this._bucketName,
                Key: key,
            });
        }
        return await getSignedUrl(this._s3, objCommand, { expiresIn: ONE_DAY_EXPIRATION_MS });
    }

    async createFileLink(filePath: string): Promise<string> {
        const getBucketFileLink = `https://${this._bucketName}.s3.${(
            await this._s3.config.region()
        ).toString()}.amazonaws.com/${filePath}`;
        const fileLink =
            this.configService.get('app.nodeEnv') === 'development'
                ? getBucketFileLink
                : this.configService.get('file.awsCloudfrontUrl') + filePath;
        return fileLink;
    }

    async getFileLinkByUrl(url: string): Promise<string> {
        const fileLink =
            this.configService.get('app.nodeEnv') === 'development' ? this.createPresignedUrlByUrl(url) : url;
        return fileLink;
    }

    async uploadToS3(dataBuffer: Buffer, filePath: string, fileType: string): Promise<any> {
        const putCommand = new PutObjectCommand({
            Bucket: this._bucketName,
            Body: dataBuffer,
            Key: filePath,
            ContentType: fileType,
            // ACL: 'public-read',
        });
        try {
            const response = await this._s3.send(putCommand);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async deleteFromS3(key: string): Promise<number> {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: this._bucketName,
            Key: key,
        });
        const deleteResult = await this._s3.send(deleteCommand);
        if (deleteResult.DeleteMarker) {
            return 1;
        }
        return 0;
    }

    async uploadMediaFile(fileGroup: string, payload: ImageFileDTO): Promise<MediaFile> {
        const filePath = `assets/${fileGroup}/${generateUUID()}-${payload.originalname}`;

        await this.uploadToS3(payload.buffer, filePath, payload.mimetype);
        const fileUrl = await this.createFileLink(filePath);

        const fileStored = await this.mediaFileRepository.save(
            this.mediaFileRepository.create({
                name: payload.originalname,
                url: fileUrl,
                key: filePath,
                type: payload.mimetype,
            }),
        );

        return fileStored;
    }

    async findOne(fields: EntityCondition<MediaFile>): Promise<NullableType<MediaFile>> {
        const data = await this.mediaFileRepository.findOne({
            where: fields,
        });
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return data;
    }

    async deleteFile(fileId: number): Promise<number> {
        const file = await this.findOne({
            id: fileId,
        });
        const deleteCommand = new DeleteObjectCommand({
            Bucket: this._bucketName,
            Key: file.key,
        });
        const deleteResult = await this._s3.send(deleteCommand);
        if (deleteResult.DeleteMarker) {
            const deleteResponse = await this.mediaFileRepository.delete(fileId);
            if (!deleteResponse.affected) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${fileId}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            return 1;
        }
        return 0;
    }

    async getS3File(fileId: number) {
        const fileInfo = await this.findOne({ id: fileId });
        const fileLink = fileInfo.url ? await this.getFileLinkByUrl(fileInfo.url) : null;
        const { id, name, type, createdAt, updatedAt } = fileInfo;
        return {
            id,
            name,
            type,
            url: fileLink,
            createdAt,
            updatedAt,
        };
    }

    async getAllFiles() {
        const files = await this.mediaFileRepository.find();
        if (files) {
            return Promise.all(
                files.map(async (file) => {
                    const { id, name, type, url, createdAt, updatedAt } = file;
                    const fileLink = url ? await this.getFileLinkByUrl(url) : null;
                    return {
                        id,
                        name,
                        type,
                        url: fileLink,
                        createdAt,
                        updatedAt,
                    };
                }),
            );
        }
        throw new AppError(
            HttpStatus.NOT_FOUND,
            `The ${this.className} data with criteria cannot be found`,
            AppError.errors.DATA_NOT_FOUND,
        );
    }
}
