"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKcet = parseKcet;
function parseKcet(text) {
    const result = {};
    const nameMatch = text.match(/(?:name\s*(?:of\s*(?:the\s*)?candidate)?)\s*[:\-]?\s*([A-Z][A-Z\s.]+)/i);
    if (nameMatch)
        result.name = nameMatch[1].trim();
    const cetMatch = text.match(/(?:CET\s*(?:no|number|reg)?\.?|application\s*(?:no|number))\s*[:\-]?\s*(\d{8,12})/i);
    if (cetMatch)
        result.cetNumber = cetMatch[1].trim();
    const rankMatch = text.match(/(?:general\s*)?(?:rank|merit)\s*[:\-]?\s*(\d{1,6})/i);
    if (rankMatch)
        result.rank = parseInt(rankMatch[1]);
    const catMatch = text.match(/(?:category\s*rank|reserved\s*rank)\s*[:\-]?\s*(\d{1,6})/i);
    if (catMatch)
        result.categoryRank = parseInt(catMatch[1]);
    return result;
}
//# sourceMappingURL=kcet.parser.js.map