import { NextRequest, NextResponse } from 'next/server';
import { aiTextService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const generatedText = await aiTextService.generateContent(prompt, context);

    return NextResponse.json({ generatedText });
  } catch (error) {
    console.error('AI Generation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
