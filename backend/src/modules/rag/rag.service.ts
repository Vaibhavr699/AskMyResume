import { Injectable } from '@nestjs/common';
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

interface ResumeAnalysis {
  skills: string[];
  score: number;
  suggestions: string;
}

@Injectable()
export class RagService {
  // Get embedding for resume context storage or search
  async getEmbedding(text: string): Promise<number[]> {
    if (!process.env.COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY is not configured in environment variables.');
    }

    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-v3.0',
      inputType: 'search_document',
    });

    return response.embeddings[0];
  }

  // Send a prompt to Cohere LLM and get response
  private async callCohereLLM(prompt: string): Promise<string> {
    try {
      const response = await cohere.generate({
        model: 'command',
        prompt,
        maxTokens: 512,
        temperature: 0.3,
      });
      return response.generations[0].text.trim();
    } catch (error: any) {
      console.error('Cohere LLM error:', error.response?.data || error.message);
      throw new Error('Cohere LLM API error');
    }
  }

  // Analyze resume and provide skills, score, and suggestions
  async analyzeResume(text: string): Promise<ResumeAnalysis> {
    const prompt = `Analyze the following resume and provide:
1. A list of technical skills (as a JSON array)
2. A score from 0-100 based on completeness, clarity, and professionalism. IMPORTANT: The score must reflect the actual content of the resume. Do NOT always return 85. Use a real score based on your analysis.
3. Suggestions for improvement

Resume:
${text}

Respond ONLY with a valid JSON object in this format (no markdown, no explanation, no extra text):
{"skills": ["skill1", "skill2"], "score": 85, "suggestions": "Improvement suggestions..."}`;

    try {
      if (!process.env.COHERE_API_KEY || process.env.COHERE_API_KEY === 'dummy-key') {
        console.warn('COHERE_API_KEY not configured, using fallback analysis');
        return {
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
          score: 75,
          suggestions: 'This is a demo analysis. Set up your COHERE_API_KEY for full AI-powered resume analysis.',
        };
      }

      const content = await this.callCohereLLM(prompt);
      console.log('Cohere LLM raw response:', content);

      if (!content) throw new Error('No content to parse');
      let result;

      try {
        result = JSON.parse(content);
      } catch (jsonErr) {
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
          console.error('Cohere LLM error: No valid JSON found in response:', content);
          throw new Error('Resume analysis failed: The AI did not return valid JSON. Raw output: ' + content);
        }
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
          console.error('Cohere LLM error: Failed to parse extracted JSON:', jsonMatch[0]);
          throw new Error('Resume analysis failed: The AI returned invalid JSON. Raw output: ' + content);
        }
      }

      // Clamp score
      let score = Number(result.score);
      if (isNaN(score) || score < 0) score = 0;
      if (score > 100) score = 100;

      return {
        skills: result.skills,
        score,
        suggestions: result.suggestions,
      };
    } catch (e: any) {
      console.error('Cohere LLM error:', e.response?.data || e.message);
      throw new Error(
        'Resume analysis failed. The AI could not process your resume. Please try again, and ensure your resume is clear and well-formatted. If the problem persists, contact support.'
      );
    }
  }

  // Use resume context to answer user's question
  async generateResponse(context: string, question: string): Promise<string> {
    const prompt = `You are a professional resume analyst and career advisor. You have access to a candidate's resume content and are helping them understand their professional profile.

RESUME CONTENT:
${context}

CANDIDATE'S QUESTION: ${question}

Please provide a professional, insightful response that:
1. Directly addresses the candidate's question about their resume
2. Uses specific details from their resume content
3. Provides constructive feedback when appropriate
4. Maintains a professional, encouraging tone
5. Offers actionable insights when possible
6. Focuses on their strengths and areas for improvement

Your response should be helpful, accurate, and professional. If the question cannot be answered based on the resume content, politely explain what information would be needed.

ANSWER:`;

    try {
      if (!process.env.COHERE_API_KEY || process.env.COHERE_API_KEY === 'dummy-key') {
        console.warn('COHERE_API_KEY not configured, using fallback response');
        return `Thank you for your question about "${question}". 

I can see your resume content and would be happy to provide professional insights. However, I'm currently running in demo mode without full AI analysis capabilities.

To receive comprehensive, AI-powered resume analysis and professional career advice, please:
1. Configure your COHERE_API_KEY environment variable
2. Restart the backend server
3. Ask your question again

In the meantime, I recommend reviewing your resume content directly to identify key information related to your question.`;
      }

      const content = await this.callCohereLLM(prompt);
      console.log('Cohere LLM raw response:', content);

      if (!content) throw new Error('No content to parse');
      return content;
    } catch (e: any) {
      console.error('Cohere LLM error:', e.response?.data || e.message);
      throw new Error('Chat failed: LLM API error');
    }
  }
}
