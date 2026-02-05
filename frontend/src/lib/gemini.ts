import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function verifyJobWithAI(jobContent: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    const prompt = `
You are an expert at verifying Indian government job notifications.

Analyze this job posting:

Title: ${jobContent.title}
Organization: ${jobContent.organization || 'Unknown'}
Source: ${jobContent.source}
Content: ${jobContent.content || jobContent.description}
Link: ${jobContent.link}

Tasks:
1. Is this a legitimate government job notification? (not fake, not spam, not ad)
2. Extract structured information:
   - Exact organization/department name
   - Post/position name
   - Total vacancies (number)
   - Application start date (YYYY-MM-DD format)
   - Application last date (YYYY-MM-DD format)
   - Exam date if mentioned (YYYY-MM-DD format)
   - Application fee (mention for different categories if applicable)
   - Qualification required
   - Age limit
   - Official notification link
3. Confidence score (0-100): How confident are you this is legitimate?
4. Red flags: Any suspicious elements? (empty array if none)
5. Category: Which category? (e.g., Railway, Banking, Defense, Teaching, Police, SSC, UPSC, State PSC, etc.)

Return ONLY valid JSON in this exact format:
{
  "isLegitimate": true/false,
  "confidence": 95,
  "extracted": {
    "organization": "...",
    "postName": "...",
    "vacancies": 1234,
    "startDate": "2026-03-01",
    "lastDate": "2026-03-31",
    "examDate": "2026-05-15",
    "fee": "General: ₹500, SC/ST: ₹250",
    "qualification": "...",
    "ageLimit": "18-33 years",
    "officialLink": "..."
  },
  "category": "Railway",
  "redFlags": [],
  "reasoning": "Brief explanation"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const verification = JSON.parse(jsonMatch[0]);
    return verification;
    
  } catch (error) {
    console.error('AI verification failed:', error);
    // Fallback to basic verification
    return {
      isLegitimate: true,
      confidence: 60,
      extracted: jobContent,
      category: 'General',
      redFlags: ['AI verification failed'],
      reasoning: 'Fallback verification'
    };
  }
}

export default genAI;
