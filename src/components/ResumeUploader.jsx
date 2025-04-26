import React from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// ✅ Set GlobalWorkerOptions manually (even if it won't be used in dev)
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

    console.log('Extracted Resume Text Length:', text.length);
    onTextExtracted(text);
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer loaded:', arrayBuffer.byteLength);

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded:', pdf.numPages, 'pages');

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      console.log(`Page ${i} text length:`, pageText.length);
      fullText += pageText + '\n';
    }

    console.log('Full extracted resume text length:', fullText.length);
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
