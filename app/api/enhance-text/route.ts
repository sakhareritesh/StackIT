import { NextRequest, NextResponse } from 'next/server';
import { aiTextService, AIEnhancementOptions } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, text, context }: AIEnhancementOptions = body;

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Text and type are required' },
        { status: 400 }
      );
    }

    const enhancedText = await aiTextService.enhanceText({
      type,
      text,
      context
    });

    return NextResponse.json({ enhancedText });
  } catch (error) {
    console.error('AI Enhancement API Error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    );
  }
}
