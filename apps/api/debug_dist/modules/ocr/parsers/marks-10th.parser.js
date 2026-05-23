"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarks10th = parseMarks10th;
function parseMarks10th(text) {
    const result = {};
    const normalized = text.replace(/[\t]+/g, ' ').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    const fullText = lines.join(' ');
    for (let i = 0; i < lines.length; i++) {
        if (/father|mother/i.test(lines[i]))
            continue;
        if (/name\s*:/i.test(lines[i])) {
            const match = lines[i].match(/name\s*:\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 3) {
                    result.name = val.toUpperCase();
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 3) {
                    result.name = val.toUpperCase();
                    break;
                }
            }
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/father(?:'?s)?\s*name/i.test(lines[i])) {
            const match = lines[i].match(/father(?:'?s)?\s*name\s*:?\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 2 && /[A-Za-z]{2}/.test(val)) {
                    result.fatherName = val.toUpperCase();
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 2 && /[A-Za-z]{2}/.test(val)) {
                    result.fatherName = val.toUpperCase();
                    break;
                }
            }
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/mother(?:'?s)?\s*nam[ec]/i.test(lines[i])) {
            const match = lines[i].match(/mother(?:'?s)?\s*nam[ec]\s*:?\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 2 && /[A-Za-z]{2}/.test(val)) {
                    result.motherName = val.toUpperCase();
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 2) {
                    result.motherName = val.toUpperCase();
                    break;
                }
            }
        }
    }
    const dobMatch = fullText.match(/(\d{1,2}[\s/.\-]\d{1,2}[\s/.\-]\d{4})/);
    if (dobMatch)
        result.dob = dobMatch[1].trim();
    if (/\bBOY\b/.test(fullText))
        result.gender = 'male';
    else if (/\bGIRL\b/.test(fullText))
        result.gender = 'female';
    const regMatch = fullText.match(/(?:no|number)\.?\s*:?\s*(\d{8,15})/i);
    if (regMatch)
        result.registerNo = regMatch[1];
    const pctMatch = fullText.match(/\((\d{1,3}\.\d{1,2})%?\)/);
    if (pctMatch)
        result.percentage = parseFloat(pctMatch[1]);
    const totalMatch = fullText.match(/TOTAL\s*MARKS\s*:?\s*([\d\s.]+)/i);
    if (totalMatch) {
        const nums = totalMatch[1].match(/\d+/g)?.map(Number) || [];
        const bigNums = nums.filter((n) => n >= 200 && n <= 700);
        if (bigNums.length > 0)
            result.totalMarks = bigNums[bigNums.length - 1];
    }
    const subjectPatterns = [
        [/MATHEMATICS/i, 'mathematics'],
        [/SOCIAL\s*SCIENCE/i, 'socialScience'],
        [/(?<!SOCIAL\s)SCIENCE/i, 'science'],
    ];
    for (const [pattern, key] of subjectPatterns) {
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                const nums = lines[i].match(/\d+/g)?.map(Number) || [];
                if (i + 1 < lines.length && /^\d/.test(lines[i + 1])) {
                    const nextNums = lines[i + 1].match(/\d+/g)?.map(Number) || [];
                    nums.push(...nextNums);
                }
                const validMarks = nums.filter((n) => n >= 30 && n <= 200);
                if (validMarks.length > 0) {
                    result[key] = validMarks[validMarks.length - 1];
                }
                break;
            }
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/FIRST\s*LANGUAGE/i.test(lines[i])) {
            const region = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
            const nums = region.match(/\d+/g)?.map(Number) || [];
            const totalCandidates = nums.filter((n) => n >= 90 && n <= 200);
            if (totalCandidates.length > 0) {
                const langName = /SANSKRIT/i.test(region) ? 'sanskrit' :
                    /HINDI/i.test(region) ? 'hindi' : 'firstLanguage';
                result[langName] = Math.max(...totalCandidates);
            }
            break;
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/SECOND\s*(?:I|L)ANGUAGE/i.test(lines[i])) {
            const region = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
            const nums = region.match(/\d+/g)?.map(Number) || [];
            const validMarks = nums.filter((n) => n >= 60 && n <= 99);
            if (validMarks.length > 0) {
                result.english = validMarks[validMarks.length - 1];
            }
            break;
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/THIRD\s*LANGUAGE|(?:^|\/)?\s*KANNADA\b/i.test(lines[i]) && !/FIRST|SECOND/i.test(lines[i])) {
            const region = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
            const nums = region.match(/\d+/g)?.map(Number) || [];
            const validMarks = nums.filter((n) => n >= 60 && n <= 99);
            if (validMarks.length > 0) {
                result.kannada = validMarks[validMarks.length - 1];
            }
            break;
        }
    }
    if (!result.kannada) {
        for (let i = 0; i < lines.length; i++) {
            if (/\bA\+/.test(lines[i])) {
                const nums = lines[i].match(/\d+/g)?.map(Number) || [];
                const validMarks = nums.filter((n) => n >= 60 && n <= 99);
                if (validMarks.length > 0) {
                    result.kannada = validMarks[validMarks.length - 1];
                    break;
                }
            }
        }
    }
    if (/karnataka|KSEAB|KSEEB|sslc/i.test(fullText)) {
        result.board = 'Karnataka State Board';
    }
    else if (/cbse|central\s*board/i.test(fullText)) {
        result.board = 'CBSE';
    }
    else if (/icse|indian\s*certificate/i.test(fullText)) {
        result.board = 'ICSE';
    }
    return result;
}
function cleanName(raw) {
    return raw.replace(/[\t\r\n]+/g, ' ').replace(/[^A-Za-z\s.]/g, '').replace(/\s{2,}/g, ' ').trim();
}
//# sourceMappingURL=marks-10th.parser.js.map