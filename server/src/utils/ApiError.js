class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        // Maintaining proper stack trace (only available on V8 engines, e.g. Node.js)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
    toString() {
        return `Error: ${this.message}\nStatus Code: ${this.statusCode}\nDetails: ${this.errors.join(', ') || 'N/A'}`;
    }

    static badRequest(msg, errors = []) {
        return new ApiError(400, msg, errors);
    }

    static unauthorized(msg) {
        return new ApiError(401, msg);
    }

    static paymentRequired(msg) {
        return new ApiError(402, msg);
    }

    static forbidden(msg) {
        return new ApiError(403, msg);
    }

    static notFound(msg) {
        return new ApiError(404, msg);
    }

    static methodNotAllowed(msg) {
        return new ApiError(405, msg);
    }

    static notAcceptable(msg) {
        return new ApiError(406, msg);
    }

    static proxyAuthenticationRequired(msg) {
        return new ApiError(407, msg);
    }

    static requestTimeout(msg) {
        return new ApiError(408, msg);
    }

    static conflict(msg) {
        return new ApiError(409, msg);
    }

    static gone(msg) {
        return new ApiError(410, msg);
    }

    static lengthRequired(msg) {
        return new ApiError(411, msg);
    }

    static preconditionFailed(msg) {
        return new ApiError(412, msg);
    }

    static payloadTooLarge(msg) {
        return new ApiError(413, msg);
    }

    static uriTooLong(msg) {
        return new ApiError(414, msg);
    }

    static unsupportedMediaType(msg) {
        return new ApiError(415, msg);
    }

    static rangeNotSatisfiable(msg) {
        return new ApiError(416, msg);
    }

    static expectationFailed(msg) {
        return new ApiError(417, msg);
    }

    static imATeapot(msg) {
        return new ApiError(418, msg);
    }

    static misdirectedRequest(msg) {
        return new ApiError(421, msg);
    }

    static unprocessableEntity(msg) {
        return new ApiError(422, msg);
    }

    static locked(msg) {
        return new ApiError(423, msg);
    }

    static failedDependency(msg) {
        return new ApiError(424, msg);
    }

    static tooEarly(msg) {
        return new ApiError(425, msg);
    }

    static upgradeRequired(msg) {
        return new ApiError(426, msg);
    }

    static preconditionRequired(msg) {
        return new ApiError(428, msg);
    }

    static tooManyRequests(msg) {
        return new ApiError(429, msg);
    }

    static requestHeaderFieldsTooLarge(msg) {
        return new ApiError(431, msg);
    }

    static unavailableForLegalReasons(msg) {
        return new ApiError(451, msg);
    }

    static internal(msg) {
        return new ApiError(500, msg);
    }

    static notImplemented(msg) {
        return new ApiError(501, msg);
    }

    static badGateway(msg) {
        return new ApiError(502, msg);
    }

    static serviceUnavailable(msg) {
        return new ApiError(503, msg);
    }

    static gatewayTimeout(msg) {
        return new ApiError(504, msg);
    }

    static httpVersionNotSupported(msg) {
        return new ApiError(505, msg);
    }

    static variantAlsoNegotiates(msg) {
        return new ApiError(506, msg);
    }

    static insufficientStorage(msg) {
        return new ApiError(507, msg);
    }

    static loopDetected(msg) {
        return new ApiError(508, msg);
    }

    static notExtended(msg) {
        return new ApiError(510, msg);
    }

    static networkAuthenticationRequired(msg) {
        return new ApiError(511, msg);
    }
}

export default ApiError;
