"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarks12th = parseMarks12th;
function parseMarks12th(text) {
    const result = {};
    const normalized = text.replace(/[\t]+/g, ' ').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    const fullText = lines.join(' ');
    for (let i = 0; i < lines.length; i++) {
        if (/father|mother/i.test(lines[i]))
            continue;
        if (/(?:candidate(?:'?s)?\.?\s*)?name\s*:/i.test(lines[i])) {
            const match = lines[i].match(/name\s*:\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 3 && /^[A-Z]/.test(val)) {
                    result.name = val;
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 3 && /^[A-Z]/.test(val)) {
                    result.name = val;
                    break;
                }
            }
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/father(?:'?s)?\s*name\s*:/i.test(lines[i])) {
            const match = lines[i].match(/father(?:'?s)?\s*name\s*:\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 2) {
                    result.fatherName = val;
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 2) {
                    result.fatherName = val;
                    break;
                }
            }
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (/mother(?:'?s)?\s*name\s*:/i.test(lines[i])) {
            const match = lines[i].match(/mother(?:'?s)?\s*name\s*:\s*(.+)/i);
            if (match) {
                const val = cleanName(match[1]);
                if (val.length > 2) {
                    result.motherName = val;
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const val = cleanName(lines[i + 1]);
                if (val.length > 2) {
                    result.motherName = val;
                    break;
                }
            }
        }
    }
    const dobMatch = fullText.match(/(\d{1,2}[\s/.\-]\d{1,2}[\s/.\-]\d{4})/);
    if (dobMatch)
        result.dob = dobMatch[1].trim();
    if (/\bMALE\b/.test(fullText) && !/FEMALE/i.test(fullText))
        result.gender = 'male';
    else if (/\bFEMALE\b/.test(fullText))
        result.gender = 'female';
    const sixDigitNums = fullText.match(/\b(\d{6})\b/g) || [];
    if (sixDigitNums.length > 0) {
        const counts = {};
        for (const n of sixDigitNums) {
            counts[n] = (counts[n] || 0) + 1;
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && sorted[0][1] >= 2) {
            result.registerNo = sorted[0][0];
        }
    }
    const marchMatch = fullText.match(/MARCH\s*(20\d{2})/i);
    if (marchMatch) {
        result.year = parseInt(marchMatch[1]);
    }
    else {
        const yearMatch = fullText.match(/MAR\s*(20\d{2})/i);
        if (yearMatch)
            result.year = parseInt(yearMatch[1]);
    }
    const subjectDefs = [
        [/\bKANNADA\b/i, 'kannada'],
        [/\bENGLISH\b/i, 'english'],
        [/\bPHYSICS\b/i, 'physics'],
        [/\bCHEMISTRY\b/i, 'chemistry'],
        [/\bMATH(?:EMATICS)?\b/i, 'maths'],
        [/\bUATHEMATICS\b/i, 'maths'],
        [/\bBIOLOGY\b/i, 'biology'],
        [/\bCOMPUTER/i, 'computerScience'],
    ];
    const tableStart = fullText.search(/(?:marks\s*obtained|scholastic|max\.?\s*marks)/i);
    const tableText = tableStart >= 0 ? fullText.substring(tableStart) : fullText;
    const presentSubjects = [];
    for (const [pattern, key] of subjectDefs) {
        const match = tableText.match(pattern);
        if (match && match.index !== undefined) {
            if (!presentSubjects.find((s) => s.key === key)) {
                presentSubjects.push({ key, idx: match.index, name: match[0], pattern });
            }
        }
    }
    presentSubjects.sort((a, b) => a.idx - b.idx);
    const regNo = result.registerNo || '';
    const isValidMark = (n) => {
        if (n.toString() === regNo)
            return false;
        if (n >= 2000 && n <= 2030)
            return false;
        if (n === 100)
            return false;
        if (n === 0)
            return false;
        return n >= 30 && n <= 99;
    };
    for (const subj of presentSubjects) {
        let tableHeaderLineIdx = 0;
        for (let i = 0; i < lines.length; i++) {
            if (/marks\s*obtained|max\.?\s*marks|register\s*no/i.test(lines[i])) {
                tableHeaderLineIdx = i;
            }
        }
        let foundLine = -1;
        for (let i = tableHeaderLineIdx; i < lines.length; i++) {
            if (subj.pattern.test(lines[i])) {
                foundLine = i;
                break;
            }
        }
        if (foundLine < 0)
            continue;
        const lineNums = lines[foundLine].match(/\d+/g)?.map(Number) || [];
        const lineMarks = lineNums.filter(isValidMark);
        if (lineMarks.length > 0) {
            result[subj.key] = lineMarks[lineMarks.length - 1];
        }
        else {
            for (let back = 1; back <= 3 && foundLine - back >= 0; back++) {
                const prevLine = lines[foundLine - back].trim();
                const prevNums = prevLine.match(/\d+/g)?.map(Number) || [];
                const prevMarks = prevNums.filter(isValidMark);
                if (prevMarks.length > 0) {
                    result[subj.key] = prevMarks[prevMarks.length - 1];
                    break;
                }
            }
        }
    }
    const totalMatch = fullText.match(/(\d{3,4})\s+(\d{3,4})\s+(?:.*?)(\d{3,4})/);
    if (totalMatch) {
        const nums = [parseInt(totalMatch[1]), parseInt(totalMatch[2]), parseInt(totalMatch[3])];
        const maxMarks = nums.find((n) => n >= 400 && n <= 700);
        const obtained = nums.filter((n) => n >= 200 && n < (maxMarks || 700));
        if (obtained.length > 0 && maxMarks) {
            result.totalMarks = obtained[obtained.length - 1];
            result.percentage = parseFloat(((obtained[obtained.length - 1] / maxMarks) * 100).toFixed(2));
        }
    }
    const totalRowMatch = fullText.match(/(?:total\s*(?:marks)?)\s*[:\s]*(\d{3,4})\s+(\d{3,4})/i);
    if (totalRowMatch) {
        const n1 = parseInt(totalRowMatch[1]);
        const n2 = parseInt(totalRowMatch[2]);
        if (n1 >= 400 && n2 < n1) {
            result.totalMarks = n2;
            result.percentage = parseFloat(((n2 / n1) * 100).toFixed(2));
        }
        else if (n2 >= 400 && n1 < n2) {
            result.totalMarks = n1;
            result.percentage = parseFloat(((n1 / n2) * 100).toFixed(2));
        }
    }
    const pctMatch = fullText.match(/\((\d{1,3}\.\d{1,2})%?\)/);
    if (pctMatch)
        result.percentage = parseFloat(pctMatch[1]);
    if (/karnataka|pre.?university|PUC|KSEAB|KSEEB/i.test(fullText)) {
        result.board = 'Karnataka State Board';
    }
    else if (/cbse|central\s*board/i.test(fullText)) {
        result.board = 'CBSE';
    }
    else if (/icse|isc|indian\s*(?:school|certificate)/i.test(fullText)) {
        result.board = 'ICSE';
    }
    return result;
}
function cleanName(raw) {
    return raw.replace(/[\t\r\n]+/g, ' ').replace(/[^A-Za-z\s.]/g, '').replace(/\s{2,}/g, ' ').trim();
}
//# sourceMappingURL=marks-12th.parser.js.map