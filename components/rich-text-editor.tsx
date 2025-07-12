"use client"

import type React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Strikethrough, List, ListOrdered, LinkIcon, ImageIcon, Sparkles } from "lucide-react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AIWriter } from "@/components/ai-writer"
import { AIFloatingMenu } from "@/components/ai-floating-menu"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedText, setSelectedText] = useState("")
  const [showAIMenu, setShowAIMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to)
      setSelectedText(selectedText)
      
      if (selectedText.trim().length > 0) {
        // Get selection coordinates
        const { view } = editor
        const start = view.coordsAtPos(from)
        const end = view.coordsAtPos(to)
        
        // Calculate center position of selection
        const x = (start.left + end.left) / 2
        const y = start.top
        
        setMenuPosition({ x, y })
        setShowAIMenu(true)
      } else {
        setShowAIMenu(false)
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
  })

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const addImage = useCallback(
    async (file: File) => {
      if (!editor) return

      try {
        // Convert image to base64
        const base64String = await convertToBase64(file)
        editor.chain().focus().setImage({ src: base64String }).run()
      } catch (error) {
        console.error("Error converting image to base64:", error)
      }
    },
    [editor],
  )

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      // Check file size (limit to 2MB for base64)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB")
        return
      }
      addImage(file)
    }
  }

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const handleAITextGenerated = useCallback((newText: string) => {
    if (editor) {
      editor.chain().focus().insertContent(newText).run()
    }
  }, [editor])

  const handleTextReplaced = useCallback((newText: string) => {
    if (editor && selectedText) {
      // Find and replace the selected text
      const { from, to } = editor.state.selection
      editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run()
      setShowAIMenu(false)
    }
  }, [editor, selectedText])

  const handleCloseAIMenu = useCallback(() => {
    setShowAIMenu(false)
    setSelectedText("")
  }, [])

  // Hide AI menu when clicking outside or losing focus
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAIMenu(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAIMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg relative" ref={editorRef}>
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200" : ""}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addLink} className={editor.isActive("link") ? "bg-gray-200" : ""}>
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleImageUpload}>
          <ImageIcon className="w-4 h-4" />
        </Button>
        
        {/* AI Writer Button */}
        <div className="ml-auto">
          <AIWriter 
            onTextGenerated={handleAITextGenerated}
            selectedText={selectedText}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Writer
              </Button>
            }
          />
        </div>
      </div>
      
      <EditorContent editor={editor} />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      
      {/* AI Floating Menu */}
      {showAIMenu && selectedText && (
        <AIFloatingMenu
          selectedText={selectedText}
          onTextReplaced={handleTextReplaced}
          position={menuPosition}
          onClose={handleCloseAIMenu}
        />
      )}
    </div>
  )
}
