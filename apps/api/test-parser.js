// Full test of both parsers with actual OCR text
const { parseMarks12th } = require('./dist/modules/ocr/parsers/marks-12th.parser');
const { parseMarks10th } = require('./dist/modules/ocr/parsers/marks-10th.parser');

const pucOcr = `23034571\t\r
GOVERNMENT or KARNATAKA\t\r
Karnataka School Examination and Assessment Board, Bengaluru\t\r
/ Marks Statement Cum Certificate\t\r
SATS No 07320M 52\t\r
qr:is is to certify that the 6eloxe has passed the Sect0'11fYcar(Pre VnivcrsityEravtittation.\t\r
No.: 354996\tMARCH 2023\t\r
REGULAR\t\r
Ntedimn:\tENGLISH\t\r
Candidate's Name: PRAJWAL NARENDRA HEGDE\t\r
Father's Name:\tNARENDRA HEGDE\t\r
I Mother's Name :\tVEENA HEGDE\t\r
i 30-10-2005\t\r
STH!RTY-OCTOBER-MO THOUSAND FIVE\tGender: MALE\t\r
/ Marks Obtained\t\r
Register No.\tMonth/Year\tIn figures Grace Marks Total Marks\t\r
Max. Marks\t\r
(2)\t\r
97\t\r
KANNADA\t354996\tMAR2023\t100\t97\t\r
81\t\r
ENGLISH\t354996\tMAR2023\t81\t\r
Part-II OptiotidLs\t\r
93\t\r
PHYSICS\t354996\tMAR2023\t100\t93\t\r
354996\tMAR2023\t100\t\r
94\t\r
UATHEMATICS\t354996\tMAR2023\trot)\t\r
100\t93\t\r
COMPUTER-SC\t3Sd996\tUAR2023\t93\t\r
600\t545\t545\t\r
Maris\t\r
DISTINCTION\t\r
TOTAL AURÆSOBZ4LVED d." FIVE FOUR FIVE\t\r
AN0703, ASC pu COLLEGE\t\r
`;

const sslcOcr = `YAS22795\t\r
21066771\t\r
GOW.RNMENT OF KARNATAKA\t\r
Karnataka Secondaty Education Examination Board\t\r
*Tliis is to certify that the below mentioned candidate has assed S.S.L.C. Examination.\tomo\t\r
No. 20210367862\tMonth -Year : JULY-2021\t\r
/ Mcdium of Instruction : ENGLISH\t/ Candidate Type : CCEREGULAR FRESH\t\r
Name : pRAJWAL NARENDRA HEGDE\t\r
Father's Name\t\r
NARENDRA HEGDE\t\r
Mother's Namc :\t\r
VEENA HEGDE\t\r
30-10-2005 THIRTIETH - OCTOBER - TWO THOUSAND FIVE\tBOY\t\r
Date of Birth :\tGcndcr :\t\r
FIRST LANGUAGE :\t\r
100\t35\t12.5\t103\t\r
SANSKRIT\t78\t25\t\r
/ SECOND IANGUAGE :\t100\t.35\t\r
80\t76\t20\t20\t96\t\r
LANGUAGE:\t\r
so\t28\t76\t20\t20\t100\t35\t96\tA+\t\r
/ MATHEMATICS\t80\t28\t58\t20\t20\t100\t35\t78\t\r
/ SCIENCE\t80\t28\t52\t20\t100\t35\t72\t\r
/ SOCIAL SCIENCE\t80\t68\t20\t20\t100\t35\t88\t\r
/ TOTAL MARKS:\t500\t175\t408\t125\t125\t625\t219\t533\t\r
FIVE HUNDRED THIRTY THREE\t\r
TOTAL .%l.ur.s OBTALNED aN WORDS)\t(85.28%)\t\r
`;

console.log('=== PUC (12th) ===');
const puc = parseMarks12th(pucOcr);
const pucExpected = { kannada: 97, english: 81, physics: 93, chemistry: 87, maths: 94, computerScience: 93 };
let pucCorrect = 0, pucTotal = 0;
for (const [k, v] of Object.entries(pucExpected)) {
  pucTotal++;
  const got = puc[k];
  const ok = got === v;
  if (ok) pucCorrect++;
  console.log(`  ${k}: expected=${v}, got=${got} ${ok ? '✓' : '✗'}`);
}
console.log(`  Score: ${pucCorrect}/${pucTotal}\n`);
console.log('  Other fields:', JSON.stringify({ name: puc.name, father: puc.fatherName, mother: puc.motherName, dob: puc.dob, gender: puc.gender, regNo: puc.registerNo, year: puc.year }));

console.log('\n=== SSLC (10th) ===');
const sslc = parseMarks10th(sslcOcr);
const sslcExpected = { sanskrit: 103, english: 96, kannada: 96, mathematics: 78, science: 72, socialScience: 88 };
let sslcCorrect = 0, sslcTotal = 0;
for (const [k, v] of Object.entries(sslcExpected)) {
  sslcTotal++;
  const got = sslc[k];
  const ok = got === v;
  if (ok) sslcCorrect++;
  console.log(`  ${k}: expected=${v}, got=${got} ${ok ? '✓' : '✗'}`);
}
console.log(`  Score: ${sslcCorrect}/${sslcTotal}\n`);
console.log('  Other fields:', JSON.stringify({ name: sslc.name, father: sslc.fatherName, mother: sslc.motherName, dob: sslc.dob, gender: sslc.gender, regNo: sslc.registerNo, pct: sslc.percentage, total: sslc.totalMarks }));
