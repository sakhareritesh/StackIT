"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, Wand2, CheckCircle, BookOpen, Briefcase, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AIFloatingMenuProps {
  selectedText: string;
  onTextReplaced: (newText: string) => void;
  position: { x: number; y: number };
  onClose: () => void;
}

type QuickAction = 'grammar' | 'enhance' | 'expand' | 'professional' | 'casual' | 'summarize';

export function AIFloatingMenu({ selectedText, onTextReplaced, position, onClose }: AIFloatingMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<QuickAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { 
      type: 'grammar' as QuickAction, 
      label: 'Fix Grammar', 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      type: 'enhance' as QuickAction, 
      label: 'Enhance', 
      icon: Sparkles, 
      color: 'text-blue-600' 
    },
    { 
      type: 'expand' as QuickAction, 
      label: 'Expand', 
      icon: BookOpen, 
      color: 'text-purple-600' 
    },
    { 
      type: 'professional' as QuickAction, 
      label: 'Professional', 
      icon: Briefcase, 
      color: 'text-gray-700' 
    },
    { 
      type: 'casual' as QuickAction, 
      label: 'Casual', 
      icon: MessageCircle, 
      color: 'text-orange-600' 
    },
    { 
      type: 'summarize' as QuickAction, 
      label: 'Summarize', 
      icon: Wand2, 
      color: 'text-indigo-600' 
    },
  ];

  const handleQuickAction = async (actionType: QuickAction) => {
    if (!selectedText.trim()) return;

    setIsLoading(true);
    setLoadingAction(actionType);

    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: actionType,
          text: selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }

      const data = await response.json();
      onTextReplaced(data.enhancedText);
      toast.success(`Text ${actionType}d successfully!`);
      onClose();
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance text. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      }}
    >
      <div className="flex flex-wrap gap-1 max-w-xs">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActionLoading = isLoading && loadingAction === action.type;
          
          return (
            <Button
              key={action.type}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction(action.type)}
              disabled={isLoading}
              className="flex items-center gap-1.5 h-8 px-2 text-xs"
            >
              <Icon className={`w-3 h-3 ${isActionLoading ? 'animate-spin' : action.color}`} />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
