export type AppConfig = {
    nodeEnv: string;
    name: string;
    rootKey: string;
    workingDirectory: string;
    clientHost?: string;
    serverHost: string;
    port: number;
    apiPrefix: string;
    version: string;
};

export type DatabaseConfig = {
    url?: string;
    type?: string;
    host?: string;
    port?: number;
    password?: string;
    name?: string;
    username?: string;
    synchronize?: boolean;
    maxConnections: number;
    sslEnabled?: boolean;
    rejectUnauthorized?: boolean;
    ca?: string;
    key?: string;
    cert?: string;
};

export type LogConfig = {
    channel?: string;
    level?: string;
    dir?: string;
    name?: string;
};

export type RedisConfig = {
    host?: string;
    port?: number;
    password?: string;
};

export type JwtConfig = {
    secret?: string;
    expires?: string;
    refreshSecret?: string;
    refreshExpires?: string;
    qrSecret?: string;
    qrExpires?: string;
    qrBlacklistExpires?: string;
    issuer?: string;
    audience?: string;
};

export type MailConfig = {
    port: number;
    host?: string;
    user?: string;
    password?: string;
    defaultEmail?: string;
    defaultName?: string;
    ignoreTLS: boolean;
    secure: boolean;
    requireTLS: boolean;
};

export type FileConfig = {
    driver: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsDefaultS3Bucket?: string;
    awsDefaultS3Url?: string;
    awsS3Region?: string;
    awsCloudfrontUrl?: string;
    maxFileSize: number;
};

export type StripeConfig = {
    apiVersion?: string;
    publicAccessKey?: string;
    secretAccessKey?: string;
    webHookSecretkey?: string;
    defaultCurrency?: string;
    paymentExpires?: number;
};

export type TwilioConfig = {
    accountSid?: string;
    authToken?: string;
    verificationServiceId?: string;
    senderPhoneNumber?: string;
};

export type SocketIoConfig = {
    serverPort?: number;
    serverPath?: string;
    serverCorsOrigin?: string;
};

export type AllConfigType = {
    app: AppConfig;
    database: DatabaseConfig;
    log: LogConfig;
    redis: RedisConfig;
    jwt: JwtConfig;
    mail: MailConfig;
    file: FileConfig;
    stripe: StripeConfig;
    socketio: SocketIoConfig;
};
