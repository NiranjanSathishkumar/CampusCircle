// Runs a Joi schema against one part of the request.
//
// Two jobs beyond reporting bad input:
//   - stripUnknown drops any key the schema doesn't declare, which is the
//     mass-assignment guard. Controllers no longer hand-maintain an
//     `allowedUpdates` whitelist.
//   - convert applies the trim/lowercase/uppercase/cast rules declared in the
//     schema, so controllers receive already-normalized values.
const validate = (schema, source = "body") => (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
        abortEarly: false,              // report every problem, not just the first
        stripUnknown: true,
        convert: true,
        errors: { wrap: { label: "" } }, // "email is required", not "\"email\" is required"
    });

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }));
        // `message` preserves the existing { message } response shape the client
        // already reads; `errors` is additive, for per-field form highlighting.
        return res.status(400).json({ message: errors[0].message, errors });
    }

    // Express 5 exposes req.query through a getter with no setter -
    // Object.assign(req.query, value) silently no-ops (verified against
    // express@5.2.1: the assigned keys never stick), so every numeric/
    // boolean Joi conversion and every schema default was being computed
    // and then discarded, with controllers reading the raw, unconverted
    // req.query all along. Redefining the property is what actually
    // replaces it. req.params is a plain writable object, so it doesn't
    // need this - merging in place works there.
    if (source === "body") {
        req.body = value;
    } else if (source === "query") {
        Object.defineProperty(req, "query", { value, configurable: true, enumerable: true });
    } else {
        Object.assign(req[source], value);
    }

    next();
};

module.exports = validate;
