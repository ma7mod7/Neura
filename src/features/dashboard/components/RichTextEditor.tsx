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
                // Tailwind classes to style the editable area
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4',
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
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
            {/* Toolbar Area */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded ${editor.isActive('strike') ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    <Strikethrough size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-blue-200 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            {/* Editable Content Area */}
            <EditorContent editor={editor} />
        </div>
    );
};