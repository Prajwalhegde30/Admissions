"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAadhaar = parseAadhaar;
function parseAadhaar(text) {
    const result = {};
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
        if (/aadhaar|government|india|unique|identification/i.test(line))
            continue;
        if (/male|female|DOB|date/i.test(line))
            continue;
        if (/^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+)+$/.test(line)) {
            result.name = line;
            break;
        }
    }
    const dobMatch = text.match(/(?:DOB|date\s*of\s*birth|d\.?o\.?b\.?)\s*[:\-]?\s*(\d{1,2}[\s/.\-]\d{1,2}[\s/.\-]\d{2,4})/i);
    if (dobMatch)
        result.dob = dobMatch[1].trim();
    if (!result.dob) {
        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch)
            result.dob = dateMatch[1];
    }
    if (/\bmale\b/i.test(text) && !/female/i.test(text)) {
        result.gender = 'male';
    }
    else if (/female/i.test(text)) {
        result.gender = 'female';
    }
    const aadhaarMatch = text.match(/(\d{4}\s*\d{4}\s*\d{4})/);
    if (aadhaarMatch) {
        const digits = aadhaarMatch[1].replace(/\s/g, '');
        result.aadhaarLast4 = digits.slice(-4);
    }
    return result;
}
//# sourceMappingURL=aadhaar.parser.js.map