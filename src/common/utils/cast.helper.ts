import Decimal from 'decimal.js';

interface ToNumberOptions {
    default?: number;
    min?: number;
    max?: number;
}

export const toLowerCase = (value: string): string => {
    return value.toLowerCase();
};

export const trim = (value: string): string => {
    return value.trim();
};

export const toDate = (value: string): Date => {
    return new Date(value);
};

export const toBoolean = (value: string): boolean => {
    value = value.toLowerCase();

    return !!(value === 'true' || value === '1');
};

export const toNumber = (value: string, opts: ToNumberOptions = {}): number => {
    let newValue: number = Number.parseInt(value || String(opts.default), 10);

    if (Number.isNaN(newValue)) {
        newValue = opts.default;
    }

    if (opts.min) {
        if (newValue < opts.min) {
            newValue = opts.min;
        }

        if (newValue > opts.max) {
            newValue = opts.max;
        }
    }

    return newValue;
};

export const toStartOfDay = (givenStartDate: string): Date => {
    const startDate = new Date(givenStartDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
};

export const toISOStartOfDay = (givenStartDate: string): string => {
    const startDate = new Date(givenStartDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate.toISOString();
};

export const toEndOfDay = (givenEndDate: string): Date => {
    const startDate = new Date(givenEndDate);
    startDate.setHours(23, 59, 59, 999);
    return startDate;
};

export const toISOEndOfDay = (givenEndDate: string): string => {
    const startDate = new Date(givenEndDate);
    startDate.setHours(23, 59, 59, 999);
    return startDate.toISOString();
};

export const decimalToString = (num = 2) => new Decimal(num).toFixed(2);

export const isDecimal = (num: number) => num % 1;
