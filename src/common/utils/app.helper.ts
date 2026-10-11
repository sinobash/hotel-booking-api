import { FORBIDDEN_MESSAGES } from '@common/constants/app.constants';
import UserError from '@common/errors/user.error';
import { AdminUserData } from '@common/interfaces/admin-user-data.interface';
import { RoleEnum } from '@modules/roles/enums/roles.enum';
import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { randomInt } from 'node:crypto';

/* Get request IP */
export const getReqIP = (req: Request): string => {
    return (
        // Determine whether there is a reverse proxy IP
        (
            (req.headers['x-forwarded-for'] as string) ||
            // Determine the IP of the backend socket
            req.socket.remoteAddress ||
            ''
        ).replace('::ffff:', '')
    );
};

/* Get request User Agent */
export const getReqUserAgent = (req: Request): string => {
    return (req.headers['User-Agent'] || req.headers['user-agent']) as string;
};

/* Determine whether the IP is an intranet */
export const IsLAN = (ip: string): any => {
    ip = ip.toLowerCase();
    if (ip == 'localhost') return true;
    let a_ip = 0;
    if (ip == '') return false;
    const aNum = ip.split('.');
    if (aNum.length != 4) return false;
    a_ip += parseInt(aNum[0]) << 24;
    a_ip += parseInt(aNum[1]) << 16;
    a_ip += parseInt(aNum[2]) << 8;
    a_ip += parseInt(aNum[3]) << 0;
    a_ip = (a_ip >> 16) & 0xffff;
    return a_ip >> 8 == 0x7f || a_ip >> 8 == 0xa || a_ip == 0xc0a8 || (a_ip >= 0xac10 && a_ip <= 0xac1f);
};

/**
 * @description: Generate random alphabet
 * @param {number} length
 * @param {*} placeholder
 * @return {*}
 */
const randomFrom = (alphabet: string, length: number): string =>
    Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');

export const generateRandomValue = (
    length: number,
    placeholder = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
): string => {
    return randomFrom(placeholder, length);
};

/**
 * @description: Generate random numbers
 * @param {number} length
 * @param {*} placeholder
 * @return {*}
 */
export const generateRandomNumber = (length: number, placeholder = '0123456789'): string => {
    return randomFrom(placeholder, length);
};

/**
 * @description: Generate username by full name
 * @param fullName
 * @returns
 */
export const generateUsername = (fullName: string): string => {
    let userName = null;
    if (fullName.indexOf(' ') !== -1) {
        const splitValue = fullName.split(/\s/);
        userName = splitValue[0].concat(generateRandomValue(5));
    } else {
        userName = fullName.concat(generateRandomValue(5));
    }
    return userName;
};

/**
 * @description: Generate bookingCode by code
 * @param code
 * @returns
 */
export const generateBookingCode = (code: string): string => {
    return code.concat(generateRandomValue(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
};

/**
 * @description: Compare current date to target date
 * @param currDate
 * @param targetDate
 * @returns -1 for lower date, 1 for greater date
 */
export const compareDates = (currDate: Date, targetDate: Date): number => {
    return currDate < targetDate ? -1 : 1;
};

/**
 * @description: Validate hotel admin assignation
 * @param currentUser
 * @param key
 * @returns boolean
 */
export const validateAdminAccess = (currentUser: AdminUserData, key: number): boolean => {
    if (currentUser.urole !== RoleEnum.ADMIN && (currentUser.ubranch === 0 || key === 0)) {
        // if (currentUser.role !== RoleEnum.admin && currentUser.branch === 0 ) {
        console.debug('debug check not admin and did not assigned with branch:', key);
        throw new UserError(
            HttpStatus.UNAUTHORIZED,
            FORBIDDEN_MESSAGES.FORBIDDEN_BRANCH_ACCESS,
            UserError.errors.CANNOT_MANAGE_USER_BRANCH,
        );
    }
    if (currentUser.urole !== RoleEnum.ADMIN && currentUser.ubranch !== key) {
        console.debug('debug check not admin and already assigned with branch:', key);
        throw new UserError(
            HttpStatus.UNAUTHORIZED,
            FORBIDDEN_MESSAGES.FORBIDDEN_BRANCH_ACCESS,
            UserError.errors.CANNOT_MANAGE_USER_BRANCH,
        );
    }
    return true;
};

/**
 * @description: create dash slug
 * @param value
 * @returns string
 */
export const createSlug = (value: string): string => {
    return value.includes(' ') ? value.replace(' ', '-').toLowerCase() : value.toLowerCase();
};

/**
 * @description: check object keys
 * @param obj
 * @param arr
 * @returns
 */
export const checkObjectKeys = (obj: any, arr: any) => {
    return Object.keys(obj).every((e) => arr.includes(e));
};
