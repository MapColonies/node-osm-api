export function response(code: number, message: string): {code: number, message: string} {
    return {
        code: code,
        message: message
    };
}