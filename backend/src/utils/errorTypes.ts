
/**
 * Class that represents a custom error with regards to Database request failures.
 */
class DatabaseRequestError extends Error {
    constructor ( msg: string, name?: string) {
        super(msg);
        if (name) {
            this.name = name;
        } else {
            this.name = "500";
        }
    }
}

/**
 * Class that represents a custom error with regards to User request failures.
 */
class BadUserRequestError extends Error {
    constructor ( msg: string, name?: string) {
        super(msg);
        if (name) {
            this.name = name;
        } else {
            this.name = "400";
        }
    }
}

/**
 * Class that represents a custom error with regards to Authentication failures.
 */
class AuthenticationError extends Error {
    constructor ( msg: string, name?: string) {
        super(msg);
        if (name) {
            this.name = name;
        } else {
            this.name = "401";
        }
    }
}

/**
 * Class that represents a custom error with regards to Authorization permissions failures.
 */
class AuthorizationError extends Error {
    constructor ( msg: string, name?: string) {
        super(msg);
        if (name) {
            this.name = name;
        } else {
            this.name = "403";
        }
    }
}

export { 
    DatabaseRequestError, 
    BadUserRequestError,
    AuthenticationError ,
    AuthorizationError
};