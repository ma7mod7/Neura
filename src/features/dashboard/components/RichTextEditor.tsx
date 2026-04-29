// src/components/RichTextEditor.tsx

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    // Initialize the TipTap editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editorProps: {
            attributes: {
                // ⭐ تم إضافة dark:text-[#E0E0E0] و dark:prose-invert لضبط لون النص في الدارك مود
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 text-gray-800 dark:text-[#E0E0E0] dark:prose-invert',
            },
        },
        // Triggered every time the user types or formats text
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML()); // Send the raw HTML back to the parent
        },
    });

    if (!editor) {
        return null;
    }

    return (
        // ⭐ تم ضبط لون الحدود والخلفية للحاوية الخارجية
        <div className="border border-gray-300 dark:border-[#2a2a2e] rounded-md overflow-hidden bg-white dark:bg-[#1A1A1A] transition-colors">
            
            {/* Toolbar Area */}
            {/* ⭐ تم ضبط لون خلفية شريط الأدوات */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 dark:border-[#2a2a2e] bg-gray-50 dark:bg-[#0e0e10] p-2 transition-colors">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-[#d0d0E0]'}`}
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-[#d0d0E0]'}`}
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-[#d0d0E0]'}`}
                >
                    <Strikethrough size={18} />
                </button>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-[#3a3a3e] mx-1"></div>
                
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-[#d0d0E0]'}`}
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-[#2a2a2e] text-gray-700 dark:text-[#d0d0E0]'}`}
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            {/* Editable Content Area */}
            <div className="bg-white dark:bg-[#1A1A1A] transition-colors">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};