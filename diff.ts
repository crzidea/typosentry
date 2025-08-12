import {diffChars} from 'diff';

export function diff(a: string, b: string) {
    const diff = diffChars(a, b);
    return diff;
}