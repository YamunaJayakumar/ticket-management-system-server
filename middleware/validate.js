const { z } = require("zod");

const validate = (schema, property = "body") => {
    return (req, res, next) => {
        
        
        const result = schema.safeParse(req[property]);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.issues,
            });
        }
        req[property] = result.data;
        next();
    };
};

module.exports = { validate };