// src/components/RichTextEditor.tsx

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
    Bold, Italic, Strikethrough, List, ListOrdered, 
    Heading1, Heading2, Quote, Code, Minus, Undo, Redo 
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

// مكون مساعد لتصميم أزرار المحرر بشكل موحد
const ToolbarButton = ({ onClick, isActive, disabled, icon: Icon, title }: any) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center
            ${isActive ? 'bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-400 shadow-sm' : 
            'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2e] hover:text-gray-900 dark:hover:text-gray-200'}
            ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : ''}`}
    >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
    </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 dark:bg-[#3a3a3e] mx-1"></div>;

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    // Initialize the TipTap editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editorProps: {
            attributes: {
                // تحسين فئات (classes) الـ prose لتبدو أجمل في الوضع العادي والداكن
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[250px] p-5 text-gray-800 dark:text-[#E0E0E0] dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600',
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
        <div className="border border-gray-300 dark:border-[#2a2a2e] rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] transition-colors shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            
            {/* Toolbar Area */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 dark:border-[#2a2a2e] bg-gray-50/80 dark:bg-[#0e0e10]/80 p-2 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                
                {/* History Group */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().undo().run()} 
                        disabled={!editor.can().chain().focus().undo().run()} 
                        icon={Undo} title="Undo" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().redo().run()} 
                        disabled={!editor.can().chain().focus().redo().run()} 
                        icon={Redo} title="Redo" 
                    />
                </div>

                <Divider />

                {/* Typography Group */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                        isActive={editor.isActive('heading', { level: 1 })} 
                        icon={Heading1} title="Heading 1" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                        isActive={editor.isActive('heading', { level: 2 })} 
                        icon={Heading2} title="Heading 2" 
                    />
                </div>

                <Divider />

                {/* Inline Formatting Group */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBold().run()} 
                        isActive={editor.isActive('bold')} 
                        icon={Bold} title="Bold" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleItalic().run()} 
                        isActive={editor.isActive('italic')} 
                        icon={Italic} title="Italic" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleStrike().run()} 
                        isActive={editor.isActive('strike')} 
                        icon={Strikethrough} title="Strikethrough" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleCode().run()} 
                        isActive={editor.isActive('code')} 
                        icon={Code} title="Inline Code" 
                    />
                </div>
                
                <Divider />
                
                {/* Block Formatting Group */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBulletList().run()} 
                        isActive={editor.isActive('bulletList')} 
                        icon={List} title="Bullet List" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                        isActive={editor.isActive('orderedList')} 
                        icon={ListOrdered} title="Ordered List" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                        isActive={editor.isActive('blockquote')} 
                        icon={Quote} title="Blockquote" 
                    />
                    <ToolbarButton 
                        onClick={() => editor.chain().focus().setHorizontalRule().run()} 
                        icon={Minus} title="Horizontal Rule" 
                    />
                </div>
            </div>

            {/* Editable Content Area */}
            <div className="bg-white dark:bg-[#1A1A1A] transition-colors cursor-text" onClick={() => editor.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};