import React from 'react';
import ReactQuill from 'react-quill';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header', 'size',
  'bold', 'italic', 'underline',
  'color', 'background',
  'list', 'bullet',
  'align'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  return (
    <div className="text-zinc-100">
      <ReactQuill 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="bg-transparent"
      />
    </div>
  );
};