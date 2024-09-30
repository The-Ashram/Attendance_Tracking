// Declare error format
type ErrorWithMessage = {
    message: string
    name: string
};

/**
 * Function determines if errors of unknown type is of ErrorWithMessage type.
 * 
 * @param error The unknown error variable.
 * @returns Boolean for if error is of ErrorWithMessage type.
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
};

/**
 * Function processes an unknown error to become an ErrorWithMessage type.
 * 
 * @param maybeError Unknown error variable.
 * @returns new Error that is processed with its error message.
 */
function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) 
    return maybeError;

    try {
        return new Error(JSON.stringify(maybeError));
    } catch {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError));
    }
};

/**
 * Returns the message in the error.
 * 
 * @param error An error of unknown type.
 * @returns String representing the message contained in the error.
 */
function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message;
};

/**
 * Returns the name of the error.
 * @param error An error of unknown type.
 * @returns String representing the name of the error.
 */
function getErrorName(error: unknown) {
    return toErrorWithMessage(error).name;
};

export { getErrorMessage, getErrorName };