"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseComedk = parseComedk;
function parseComedk(text) {
    const result = {};
    const nameMatch = text.match(/(?:name\s*(?:of\s*(?:the\s*)?candidate)?)\s*[:\-]?\s*([A-Z][A-Z\s.]+)/i);
    if (nameMatch)
        result.name = nameMatch[1].trim();
    const numMatch = text.match(/(?:COMEDK|application|registration)\s*(?:no|number)?\s*[:\-]?\s*([A-Z0-9\-]+)/i);
    if (numMatch)
        result.comedkNumber = numMatch[1].trim();
    const rankMatch = text.match(/(?:rank|merit\s*(?:rank)?)\s*[:\-]?\s*(\d{1,6})/i);
    if (rankMatch)
        result.rank = parseInt(rankMatch[1]);
    return result;
}
//# sourceMappingURL=comedk.parser.js.map