import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface GroqOcrResult {
  extracted: Record<string, unknown>;
  rawText: string;
}

@Injectable()
export class GroqOcrService {
  private readonly logger = new Logger(GroqOcrService.name);
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('GROQ_API_KEY not set. OCR will not work.');
    }
  }

  /**
   * Process a document image using Groq Vision LLM.
   * Returns structured extracted data based on document type.
   */
  async processDocument(
    filePath: string,
    documentType: string,
  ): Promise<GroqOcrResult> {
    if (!this.apiKey) {
      return { extracted: {}, rawText: 'Groq API key not configured' };
    }

    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const mimeType = this.getMimeType(ext);
    const base64Image = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const prompt = this.getPromptForDocumentType(documentType);

    this.logger.log(
      `Processing ${documentType} via Groq Vision (${(fileBuffer.length / 1024).toFixed(0)}KB)...`,
    );

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.2-90b-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: { url: dataUri },
                  },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 2000,
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Groq API error ${response.status}: ${errorBody}`);
        throw new Error(`Groq API returned ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';

      this.logger.log(`Groq returned ${content.length} chars`);

      // Parse JSON from the response
      const extracted = this.parseJsonFromResponse(content);

      return {
        extracted,
        rawText: content,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Groq OCR failed: ${msg}`);
      return { extracted: {}, rawText: `Error: ${msg}` };
    }
  }

  private getPromptForDocumentType(documentType: string): string {
    const baseInstruction =
      'Extract information from this document image. Return ONLY a valid JSON object with the fields specified. No markdown, no explanation, just the JSON.';

    switch (documentType) {
      case 'marks_card_10th':
        return `${baseInstruction}
Fields to extract:
{
  "name": "full name of the student",
  "fatherName": "father's name",
  "motherName": "mother's name",
  "dob": "date of birth (DD/MM/YYYY format)",
  "gender": "male or female",
  "registerNo": "registration/roll number",
  "board": "board name (e.g., Karnataka State Board, CBSE, ICSE)",
  "percentage": percentage as a number,
  "totalMarks": total marks as a number,
  "mathematics": marks in mathematics as a number,
  "science": marks in science as a number,
  "socialScience": marks in social science as a number,
  "english": marks in english as a number,
  "firstLanguage": marks in first language as a number,
  "thirdLanguage": marks in third language as a number
}
If a field is not visible or unclear, use null.`;

      case 'marks_card_12th':
        return `${baseInstruction}
Fields to extract:
{
  "name": "full name of the student",
  "registerNo": "registration/roll number",
  "board": "board name",
  "year": year of passing as a number,
  "percentage": overall percentage as a number,
  "physics": marks in physics as a number,
  "chemistry": marks in chemistry as a number,
  "maths": marks in mathematics as a number,
  "pcmPercentage": PCM average percentage as a number
}
If a field is not visible or unclear, use null.`;

      case 'kcet_rank_card':
        return `${baseInstruction}
Fields to extract:
{
  "name": "full name of the student",
  "cetNumber": "CET registration/application number",
  "rank": overall rank as a number,
  "categoryRank": category rank as a number (if applicable)
}
If a field is not visible or unclear, use null.`;

      case 'comedk_rank_card':
        return `${baseInstruction}
Fields to extract:
{
  "name": "full name of the student",
  "comedkNumber": "COMEDK registration number",
  "rank": overall rank as a number
}
If a field is not visible or unclear, use null.`;

      case 'aadhaar':
        return `${baseInstruction}
Fields to extract:
{
  "name": "full name as on Aadhaar",
  "dob": "date of birth (DD/MM/YYYY format)",
  "gender": "male or female",
  "aadhaarNumber": "Aadhaar number (12 digits, can include spaces)"
}
If a field is not visible or unclear, use null.`;

      default:
        return `${baseInstruction}
Extract all visible text and key information as a JSON object with descriptive field names.`;
    }
  }

  private parseJsonFromResponse(content: string): Record<string, unknown> {
    try {
      // Try direct parse first
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {
          // fall through
        }
      }

      // Try to find any JSON object in the text
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          return JSON.parse(braceMatch[0]);
        } catch {
          // fall through
        }
      }

      return { rawText: content };
    }
  }

  private getMimeType(ext: string): string {
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'image/jpeg';
    }
  }
}
