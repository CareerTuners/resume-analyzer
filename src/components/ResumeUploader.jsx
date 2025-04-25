import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResumeUploader = ({ onTextExtracted }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    let text = '';

    if (fileType === 'pdf') {
      text = await extractTextFromPDF(file);
    } else if (fileType === 'docx') {
      text = await extractTextFromDOCX(file);
    } else {
      alert('Unsupported file type. Please upload a PDF or DOCX resume.');
      return;
    }

    if (!text || text.trim().length < 10) {
      alert('Failed to extract text. Please try another file.');
      return;
    }

    onTextExtracted(text); // ✅ This must be called
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(' ');
      fullText += text + '\n';
    }

    return fullText;
  };

  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center p-4 border rounded-lg shadow">
      <label className="block mb-2 font-semibold">Upload Resume (PDF or DOCX)</label>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="mb-4"
      />
    </div>
  );
};

export default ResumeUploader;
