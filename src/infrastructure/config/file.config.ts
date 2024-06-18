import { registerAs } from '@nestjs/config';
import { FileConfig } from './config.type';

export default registerAs<FileConfig>('file', () => {
    return {
        driver: process.env.FILE_DRIVER ?? 'local',
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
        awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
        awsS3Region: process.env.AWS_S3_REGION,
        awsCloudfrontUrl: process.env.AWS_CLOUDFRONT_URL,
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 2048,
    };
});
