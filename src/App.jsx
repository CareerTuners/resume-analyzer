import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resumeFromStorage = localStorage.getItem('resume_text');
    const jdFromStorage = localStorage.getItem('job_description');

    if (resumeFromStorage && jdFromStorage) {
      setResumeText(resumeFromStorage);
      setJobDescription(jdFromStorage);
      analyzeWithGPT();
      localStorage.removeItem('resume_text');
      localStorage.removeItem('job_description');
    }
  }, []);

  const analyzeWithGPT = async () => {
    if (!resumeText || !jobDescription) return;

    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('https://analyze-gpt.contact-cb5.workers.dev/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText, jobDescription: jobDescription }),
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Analysis Error:', error);
      setAnalysisResult(null);
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-section');
    html2pdf().from(element).save('resume-analysis-report.pdf');
  };

  return (
    <div className="flex min-h-screen font-poppins bg-[#F5F7FC]">

      {/* Sidebar */}
      <aside className="w-1/3 p-6 sticky top-0 h-screen overflow-y-auto bg-[#F5F7FC] border-r border-gray-200">
        <div className="space-y-6">
          {/* Your Score */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Your Score</h2>
            <div className="text-center text-4xl font-bold text-[#6184B3]">{analysisResult?.overall_resume_score || '—'}%</div>
            <p className="text-center text-gray-500 mt-2">{analysisResult ? `${analysisResult?.total_issues || 0} Issues Found` : ''}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h3 className="text-md font-bold text-gray-800 mb-2">Content</h3>
            <p>Score: {analysisResult?.content_score || '—'}%</p>
            <p className="text-green-600 text-sm mt-2">Strengths: {analysisResult?.content_strengths?.[0] || '—'}</p>
            <p className="text-red-500 text-sm">Issues: {analysisResult?.content_issues?.[0] || '—'}</p>
          </div>

          {/* Format */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h3 className="text-md font-bold text-gray-800 mb-2">Format</h3>
            <p>Score: {analysisResult?.format_score || '—'}%</p>
            <p className="text-green-600 text-sm mt-2">Strengths: {analysisResult?.format_strengths?.[0] || '—'}</p>
            <p className="text-red-500 text-sm">Issues: {analysisResult?.format_issues?.[0] || '—'}</p>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h3 className="text-md font-bold text-gray-800 mb-2">Sections</h3>
            <p>Score: {analysisResult?.sections_score || '—'}%</p>
            <p className="text-green-600 text-sm mt-2">Present: {analysisResult?.present_sections?.join(', ') || '—'}</p>
            <p className="text-red-500 text-sm">Missing: {analysisResult?.missing_sections?.join(', ') || '—'}</p>
          </div>

          {/* Design */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h3 className="text-md font-bold text-gray-800 mb-2">Design</h3>
            <p>Score: {analysisResult?.design_score || '—'}%</p>
            <p className="text-green-600 text-sm mt-2">Strengths: {analysisResult?.style_strengths?.[0] || '—'}</p>
          </div>
        </div>
      </aside>

      {/* Main Analysis Section */}
      <main className="w-2/3 p-10 bg-white" id="analysis-section">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full animate-pulse">
            <div className="text-2xl font-bold text-gray-400 mb-4">Analyzing Resume...</div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : analysisResult ? (
          <div className="space-y-10">
            {/* Matched Keywords */}
            <section className="bg-[#DEE5EF] p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold text-black mb-4">Matched Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matching_keywords?.map((kw, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </section>

            {/* Missing Keywords */}
            <section className="bg-[#DEE5EF] p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold text-black mb-4">Missing Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missing_keywords?.map((kw, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </section>

            {/* Actionable Tips */}
            <section className="bg-[#DEE5EF] p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold text-black mb-4">Actionable Recommendations</h2>
              <ul className="list-disc pl-5 space-y-2 text-black">
                {analysisResult.actionable_recommendations?.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </section>

            {/* Download Button */}
            <div className="text-center">
              <button
                onClick={handleDownloadPDF}
                className="bg-[#6184B3] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition mt-6"
              >
                Download Full Report
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-gray-400 mt-32">
            Upload a resume and job description to start analysis.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
