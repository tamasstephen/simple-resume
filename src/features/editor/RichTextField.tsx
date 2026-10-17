import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId } from "react";
import { FieldLabel, FieldMessage } from "./TextField";

export interface RichTextFieldProps {
  value: string;
  onChange: (html: string) => void;
  ariaLabel: string;
  /** Visible label above the box; the accessible name stays `ariaLabel`. */
  label?: string;
  isOptional?: boolean;
  helper?: string;
}

function BulletListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 6h10M10 12h10M10 18h10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 4.5 5 4v4M3.5 10.5h3l-3 3.5h3M3.5 16h3v4h-3M4.5 18h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
export function RichTextField({
  value,
  onChange,
  ariaLabel,
  label,
  isOptional = false,
  helper,
}: RichTextFieldProps) {
  const messageId = useId();
  const editor = useEditor({
    extensions: [starterKit],
    content: value,
    editorProps: {
      attributes: {
        "aria-label": ariaLabel,
        role: "textbox",
        "aria-multiline": "true",
        ...(helper === undefined ? {} : { "aria-describedby": messageId }),
      },
    },
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
    <div className="field">
      {label !== undefined && <FieldLabel label={label} isOptional={isOptional} />}
      <div className="rich-text">
        <div className="rich-text__toolbar" role="toolbar" aria-label={`${ariaLabel} formatting`}>
          <button
            type="button"
            className="rich-text__button"
            aria-label={`${ariaLabel} bold`}
            aria-pressed={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            type="button"
            className="rich-text__button"
            aria-label={`${ariaLabel} italic`}
            aria-pressed={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <span className="rich-text__separator" aria-hidden="true" />
          <button
            type="button"
            className="rich-text__button"
            aria-label={`${ariaLabel} bullet list`}
            aria-pressed={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <BulletListIcon />
          </button>
          <button
            type="button"
            className="rich-text__button"
            aria-label={`${ariaLabel} numbered list`}
            aria-pressed={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <NumberedListIcon />
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <FieldMessage id={messageId} helper={helper} />
    </div>
  );
}
