import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export interface RichTextFieldProps {
  value: string;
  onChange: (html: string) => void;
  ariaLabel: string;
}

// Trim StarterKit to the supported subset: bold, italic, bullet/ordered lists.
const starterKit = StarterKit.configure({
  heading: false,
  blockquote: false,
  codeBlock: false,
  code: false,
  horizontalRule: false,
  strike: false,
  link: false,
  underline: false,
});

/** Rich-text field limited to bold/italic/lists; emits HTML via onChange. */
export function RichTextField({ value, onChange, ariaLabel }: RichTextFieldProps) {
  const editor = useEditor({
    extensions: [starterKit],
    content: value,
    editorProps: { attributes: { "aria-label": ariaLabel, role: "textbox" } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Keep the editor in sync when the value is reset externally (e.g. Cancel,
  // switching which item is being edited).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="rich-text" aria-label={ariaLabel} role="textbox" />;
  }

  return (
    <div className="rich-text">
      <div className="rich-text__toolbar" role="toolbar" aria-label={`${ariaLabel} formatting`}>
        <button
          type="button"
          className="btn btn--toggle"
          aria-label={`${ariaLabel} bold`}
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="btn btn--toggle"
          aria-label={`${ariaLabel} italic`}
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className="btn btn--toggle"
          aria-label={`${ariaLabel} bullet list`}
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>
        <button
          type="button"
          className="btn btn--toggle"
          aria-label={`${ariaLabel} numbered list`}
          aria-pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbers
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
