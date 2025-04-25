import React, { useState, useEffect } from 'react';
import ResumeUploader from './components/ResumeUploader';
import html2pdf from 'html2pdf.js';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    console.log('Resume text updated:', resumeText);

    // Load saved reports from LocalStorage
    const saved = JSON.parse(localStorage.getItem('resume_analysis_reports')) || [];
    setSavedReports(saved);
  }, []);

  const analyzeWithGPT = async () => {
    if (!resumeText || resumeText.trim().length < 20) {
      alert('Resume text is empty or too short. Please re-upload the file.');
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      alert('Job description is empty or too short. Please enter a valid one.');
      return;
    }
    

    setLoading(true);
    setAnalysisResult('');

    const maxResumeLength = 8000;
    const maxJDLength = 3000;

    const trimmedResume = resumeText.slice(0, maxResumeLength);
    const trimmedJD = jobDescription.slice(0, maxJDLength);

    try {
      const response = await fetch('https://analyze-gpt.contact-cb5.workers.dev/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: trimmedResume,
          jobDescription: trimmedJD,
        }),
      });


      const data = await response.json();
      console.log('Full GPT Response:', JSON.stringify(data, null, 2));
      const finalResult = data.choices?.[0]?.message?.content || 'No response from GPT.';
      setAnalysisResult(finalResult);

      // Save this report to LocalStorage
      saveReport(finalResult);

    } catch (error) {
      console.error('GPT Error:', error);
      setAnalysisResult('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const saveReport = (reportContent) => {
    const reports = JSON.parse(localStorage.getItem('resume_analysis_reports')) || [];
    const timestamp = new Date().toISOString();
    const newReport = { id: timestamp, content: reportContent };
    const updatedReports = [newReport, ...reports.slice(0, 9)]; // Keep only latest 10
    localStorage.setItem('resume_analysis_reports', JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-report');
    const options = {
      margin: 0.5,
      filename: 'resume_analysis_report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(options).from(element).save();
  };

  const getMatchStrength = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600' };
    if (score >= 50) return { label: 'Moderate Match', color: 'text-yellow-500' };
    return { label: 'Weak Match', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Resume Analyzer</h1>

      <ResumeUploader onTextExtracted={setResumeText} />

      <div className="max-w-lg mx-auto mt-8">
        <label className="block mb-2 font-semibold">Paste Job Description</label>
        <textarea
          rows={6}
          className="w-full p-2 border rounded mb-4"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 w-full"
          onClick={analyzeWithGPT}
          disabled={loading}
        >
          {loading ? 'Analyzing…' : 'Analyze Resume'}
        </button>
      </div>

      {/* Live Analysis Result */}
      {analysisResult && (
        <div id="analysis-report" className="mt-12 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-left">
          {(() => {
            try {
              let result = JSON.parse(analysisResult);

              if (result.SimilarityScore) {
              result = {
                similarity_score: result.SimilarityScore,
                matching_keywords: result.MatchingKeywords || [],
                missing_keywords: result.MissingKeywords || [],
                actionable_recommendations: result.ActionableRecommendations || [],
              };
              }

              const { label, color } = getMatchStrength(result.similarity_score);

              return (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">Similarity Score</h2>
                    <div className="text-3xl font-bold mb-2">{result.similarity_score}%</div>
                    <div className="text-md font-semibold mb-6">
                      <span className={`${color}`}>{label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${result.similarity_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <hr className="my-8" />

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">Matching Keywords</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.matching_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="my-8" />

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Missing Keywords</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="my-8" />

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Actionable Recommendations</h2>
                    <ul className="list-disc list-inside text-gray-700">
                      {result.actionable_recommendations.map((rec, index) => (
                        <li key={index} className="mb-2">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded mt-6"
                    onClick={handleDownloadPDF}
                  >
                    Download Report as PDF
                  </button>
                </>
              );
            } catch (error) {
              return <p className="text-red-500">Failed to parse analysis result.</p>;
            }
          })()}
        </div>
      )}

      {/* Saved Reports Section */}
      {savedReports.length > 0 && (
  <div className="mt-16 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-800">Previous Analyses</h2>
      <button
        className="text-sm bg-red-600 text-white px-3 py-1 rounded"
        onClick={() => {
          localStorage.removeItem('resume_analysis_reports');
          setSavedReports([]);
        }}
      >
        Clear All
      </button>
    </div>

    <div className="grid gap-4">
      {savedReports.map((report) => {
        try {
          const result = JSON.parse(report.content);
          return (
            <div key={report.id} className="bg-white p-4 rounded-lg shadow text-sm">
              <p className="mb-1"><strong>Score:</strong> {result.similarity_score}%</p>
              <p className="mb-1"><strong>Matches:</strong> {result.matching_keywords.slice(0, 5).join(', ')}...</p>
              <p className="mb-1"><strong>Missing:</strong> {result.missing_keywords.slice(0, 3).join(', ')}...</p>
              <p><strong>Tips:</strong> {result.actionable_recommendations[0]}</p>
            </div>
          );
        } catch {
          return <pre key={report.id} className="bg-white p-4 rounded-lg shadow">{report.content}</pre>;
        }
      })}
    </div>
  </div>
)}

    </div>
  );
}

export default App;
