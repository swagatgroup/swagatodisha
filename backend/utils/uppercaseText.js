// Mongoose plugin: store free-text String fields in UPPERCASE.
// The setter also runs on updates (updateOne/findOneAndUpdate $set) and on query
// filters, so exact-match filters like { 'courseDetails.stream': 'cse' } still match.
// Skipped: enums, lowercase fields, emails, passwords, URLs, files, tokens/IDs/codes,
// and code-like fields the app compares against fixed values (category, relationship, ...).

const SKIP_FIELD = /email|password|url|link|website|token|otp|code|file|path|mime|picture|image|photo|version|stage|status|action|type|section|role|method|category|relationship|steps|fields/i;
const SKIP_ID = /Id$/;

// Dropdown sentinel values the frontend compares against literally (e.g. selectedCourse === 'Other')
const KEEP_VALUES = new Set(['Other']);

const toUpper = (v) => (typeof v === 'string' && !KEEP_VALUES.has(v) ? v.toUpperCase() : v);

const shouldUppercase = (name, schemaType) => {
    if (schemaType.instance !== 'String') return false;
    if (schemaType.enumValues && schemaType.enumValues.length) return false;
    if (schemaType.options.lowercase) return false;
    const leaf = name.split('.').pop();
    return !SKIP_FIELD.test(leaf) && !SKIP_ID.test(leaf);
};

function uppercaseText(schema) {
    schema.eachPath((name, schemaType) => {
        if (schemaType.schema) return uppercaseText(schemaType.schema);
        if (!shouldUppercase(name, schemaType)) return;
        schemaType.set(toUpper);
        schemaType.$uppercaseText = true;
    });
}

module.exports = uppercaseText;
module.exports.toUpper = toUpper;
