// Maps common Mongoose document.save() failures to client-facing responses.
// Returns true if the error was handled (caller should just `return`), false
// if the caller should rethrow so it reaches the centralized error handler.
module.exports.sendSaveError = (err, res) => {
    if (err.name === "ValidationError") {
        res.status(400).json({ message: err.message });
        return true;
    }
    // Concurrent request touched the same document first (optimistic
    // versioning via __v) - this is a normal collision under concurrent
    // edits, not a server fault, so it gets a 409 instead of falling
    // through to the generic 500.
    if (err.name === "VersionError") {
        res.status(409).json({ message: "This was updated somewhere else. Please retry." });
        return true;
    }
    return false;
};
