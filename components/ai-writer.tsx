"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AIWriterProps {
  onTextGenerated: (text: string) => void;
  selectedText?: string;
  trigger?: React.ReactNode;
}

type EnhancementType = 'enhance' | 'grammar' | 'expand' | 'summarize' | 'professional' | 'casual';

export function AIWriter({ onTextGenerated, selectedText, trigger }: AIWriterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancementType, setEnhancementType] = useState<EnhancementType>('enhance');
  const [inputText, setInputText] = useState(selectedText || '');
  const [generatedText, setGeneratedText] = useState('');
  const [prompt, setPrompt] = useState('');

  const enhancementOptions = [
    { value: 'enhance', label: 'Enhance Text', description: 'Make text clearer and more engaging' },
    { value: 'grammar', label: 'Fix Grammar', description: 'Correct grammar and spelling errors' },
    { value: 'expand', label: 'Expand Content', description: 'Add more details and examples' },
    { value: 'summarize', label: 'Summarize', description: 'Create a concise summary' },
    { value: 'professional', label: 'Make Professional', description: 'Convert to formal tone' },
    { value: 'casual', label: 'Make Casual', description: 'Convert to friendly tone' },
  ];

  const enhanceText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to enhance');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: enhancementType,
          text: inputText,
          context: prompt || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      setGeneratedText(data.enhancedText);
      toast.success('Text enhanced successfully!');
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to generate content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: inputText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedText(data.generatedText);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const useGeneratedText = () => {
    onTextGenerated(generatedText);
    setIsOpen(false);
    setGeneratedText('');
    setInputText('');
    setPrompt('');
    toast.success('Text applied successfully!');
  };

  const resetForm = () => {
    setGeneratedText('');
    setInputText(selectedText || '');
    setPrompt('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Writer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Writing Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enhancement Type
              </label>
              <Select value={enhancementType} onValueChange={(value: EnhancementType) => setEnhancementType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enhancementOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Text to Enhance (optional if using prompt)
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to enhance..."
                className="min-h-[120px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                AI Prompt (for content generation)
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt to generate new content..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={enhanceText}
                disabled={isLoading || !inputText.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Text
                  </>
                )}
              </Button>
              
              <Button
                onClick={generateFromPrompt}
                disabled={isLoading || !prompt.trim()}
                variant="secondary"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Generated Text
              </label>
              <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
                {generatedText ? (
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: generatedText }} />
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Enhanced text will appear here...
                  </div>
                )}
              </div>
            </div>

            {generatedText && (
              <div className="flex gap-2">
                <Button onClick={useGeneratedText} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This Text
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
