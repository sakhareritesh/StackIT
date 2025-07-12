import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIEnhancementOptions {
  type: 'enhance' | 'grammar' | 'expand' | 'summarize' | 'professional' | 'casual';
  text: string;
  context?: string;
}

export class AITextService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async enhanceText(options: AIEnhancementOptions): Promise<string> {
    const { type, text, context } = options;
    
    let prompt = '';
    
    switch (type) {
      case 'enhance':
        prompt = `Enhance the following text to make it clearer, more engaging, and better structured while maintaining its original meaning and tone. Keep the same format (HTML if applicable):

Original text: ${text}

Enhanced text:`;
        break;
        
      case 'grammar':
        prompt = `Fix any grammatical errors, spelling mistakes, and improve sentence structure in the following text while preserving the original meaning and tone. Keep the same format (HTML if applicable):

Original text: ${text}

Corrected text:`;
        break;
        
      case 'expand':
        prompt = `Expand the following text with more details, examples, and explanations while maintaining the same topic and tone. Keep the same format (HTML if applicable):

Original text: ${text}

Expanded text:`;
        break;
        
      case 'summarize':
        prompt = `Summarize the following text while keeping the key points and main ideas. Keep the same format (HTML if applicable):

Original text: ${text}

Summary:`;
        break;
        
      case 'professional':
        prompt = `Rewrite the following text in a more professional and formal tone suitable for business or academic contexts. Keep the same format (HTML if applicable):

Original text: ${text}

Professional version:`;
        break;
        
      case 'casual':
        prompt = `Rewrite the following text in a more casual and friendly tone. Keep the same format (HTML if applicable):

Original text: ${text}

Casual version:`;
        break;
    }
    
    if (context) {
      prompt += `\n\nContext: ${context}`;
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      throw new Error('Failed to enhance text. Please try again.');
    }
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context 
      ? `Context: ${context}\n\nRequest: ${prompt}\n\nResponse:`
      : prompt;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }
}

export const aiTextService = new AITextService();
