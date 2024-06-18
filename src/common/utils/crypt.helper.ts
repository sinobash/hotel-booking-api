import { compare, genSalt, hash } from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';

/**
 * @description: Bcrypt hashing
 * @param {*} data
 * @returns {*}
 */
export const doHash = async (data: string): Promise<string> => {
    const saltOrRounds = 12;
    const salt = await genSalt(saltOrRounds);
    return await hash(data, salt);
};

/**
 * @description: Bcrypt compare
 * @param {*} password
 * @param {*} hash
 * @returns {*}
 */
export const doCompare = async (password: string, hash: string): Promise<boolean> => {
    return await compare(password, hash);
};

/**
 * @description: AES encryption
 * @param {string} msg
 * @param {string} secret
 * @return {*}
 */
export const aesEncrypt = (msg: string, secret: string): string => {
    return CryptoJS.AES.encrypt(msg, secret).toString();
};

/**
 * @description: AES decryption
 * @param {string} encrypted
 * @param {string} secret
 * @return {*}
 */
export const aesDecrypt = (encrypted: string, secret: string): string => {
    return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
};

/**
 * @description: md5 encryption
 * @param {string} msg
 * @return {*}
 */
export const md5 = (msg: string): string => {
    return CryptoJS.MD5(msg).toString();
};

/**
 * @description: Generate a UUID
 * @param {*}
 * @return {*}
 */
export const generateUUID = (): string => {
    return nanoid();
};
