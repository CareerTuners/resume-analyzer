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
      setAnalysisResult('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-section');
    html2pdf().from(element).save('resume-analysis-report.pdf');
  };

  return (
    <div className="flex min-h-screen bg-white font-poppins">
      
      {/* Sidebar */}
      <div className="w-1/3 bg-[#F5F7FC] p-6 sticky top-0 h-screen overflow-y-auto">
        {/* Score Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Your Score</h2>
          <div className="text-4xl font-bold text-center text-[#6184B3]">70%</div>
          <p className="text-center mt-2 text-gray-600">23 Issues Found</p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 border border-gray-200">
          <h3 className="text-md font-bold text-gray-700 mb-2">Content</h3>
          <p>Score: 72%</p>
          <p className="text-green-600 text-sm">Strengths: Clear Achievements</p>
          <p className="text-red-500 text-sm">Issues: Missing Keywords</p>
        </div>

        {/* Format Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 border border-gray-200">
          <h3 className="text-md font-bold text-gray-700 mb-2">Format</h3>
          <p>Score: 80%</p>
          <p className="text-green-600 text-sm">Strengths: Clean Layout</p>
          <p className="text-red-500 text-sm">Issues: Font Size Inconsistency</p>
        </div>

        {/* Sections Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 border border-gray-200">
          <h3 className="text-md font-bold text-gray-700 mb-2">Sections</h3>
          <p>Score: 68%</p>
          <p className="text-green-600 text-sm">Present: Work History, Education</p>
          <p className="text-red-500 text-sm">Missing: Skills Section</p>
        </div>

        {/* Design Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-md font-bold text-gray-700 mb-2">Design</h3>
          <p>Score: 75%</p>
          <p className="text-green-600 text-sm">Strengths: Good Use of White Space</p>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="w-2/3 p-8 bg-white" id="analysis-section">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full animate-pulse">
            <div className="text-2xl font-bold text-gray-500 mb-4">Analyzing Resume...</div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : analysisResult ? (
          <div className="space-y-8">
            {/* Matched Keywords */}
            <section className="bg-[#DEE5EF] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-black">Matched Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matching_keywords?.map((kw, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-lg">
                    {kw}
                  </span>
                ))}
              </div>
            </section>

            {/* Missing Keywords */}
            <section className="bg-[#DEE5EF] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-black">Missing Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missing_keywords?.map((kw, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-lg">
                    {kw}
                  </span>
                ))}
              </div>
            </section>

            {/* Actionable Tips */}
            <section className="bg-[#DEE5EF] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-black">Actionable Recommendations</h2>
              <ul className="list-disc pl-5 text-black">
                {analysisResult.actionable_recommendations?.map((tip, idx) => (
                  <li key={idx} className="mb-2">{tip}</li>
                ))}
              </ul>
            </section>

            {/* Download Report Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleDownloadPDF}
                className="bg-[#6184B3] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Download Full Report
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-20">
            Upload a resume and job description to start analysis.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
