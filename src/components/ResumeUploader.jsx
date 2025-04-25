import React, { useState } from 'react';

const ResumeUploader = ({ onTextExtracted }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result;
      console.log('Extracted RAW Text:', text);
      onTextExtracted(text); // 💥 this should set the resume text
    };
    reader.readAsText(file); // just raw text (no parsing for now)
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center p-4 border rounded-lg shadow">
      <label className="block mb-2 font-semibold">Upload Resume (TXT for now!)</label>
      <input type="file" accept=".txt" onChange={handleFileUpload} className="mb-4" />
    </div>
  );
};

export default ResumeUploader;
