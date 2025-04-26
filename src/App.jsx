import React, { useState, useEffect } from 'react';
import ResumeUploader from './components/ResumeUploader';
import html2pdf from 'html2pdf.js';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
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
    setAnalysisResult(null);

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
      setAnalysisResult(data);
      saveReport(JSON.stringify(data));

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
    const updatedReports = [newReport, ...reports.slice(0, 9)];
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
    return { label: 'Weak Match', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-white via-gray-50 to-gray-100 font-poppins">
      
      {/* Hero Section */}
      <section className="w-full text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          AI-Powered Resume Analyzer
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Upload your resume, match it against your dream job, and get instant personalized feedback!
        </p>
      </section>

      {/* Upload Section */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md border border-gray-200 p-8 rounded-2xl shadow-xl mb-12">
        <ResumeUploader onTextExtracted={setResumeText} />

        <div className="mt-6">
          <label className="block mb-2 font-semibold text-gray-700">Paste Job Description</label>
          <textarea
            rows={6}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Paste the target Job Description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all ${
            loading ? 'bg-blue-400 animate-pulse cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={analyzeWithGPT}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {/* Analysis Result Section */}
      {analysisResult && typeof analysisResult === 'object' && (
        <div id="analysis-report" className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl mb-16 animate-fade-in-down">
          {(() => {
            try {
              let result = analysisResult;

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
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-blue-700 mb-2">Similarity Score</h2>
                    <div className="text-5xl font-bold">{result.similarity_score}%</div>
                    <div className={`text-lg font-semibold ${color}`}>{label}</div>
                    <div className="w-full bg-gray-300 h-3 rounded-full mt-4">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${result.similarity_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-green-700 mb-2">Matching Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.matching_keywords.map((kw, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-red-700 mb-2">Missing Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.map((kw, idx) => (
                          <span key={idx} className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded shadow">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Actionable Recommendations</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {result.actionable_recommendations.map((rec, idx) => (
                        <li key={idx} className="mb-2">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-center mt-8">
                    <button
                      onClick={handleDownloadPDF}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                      Download Report as PDF
                    </button>
                  </div>
                </>
              );
            } catch (error) {
              console.error('Parsing Error:', error);
              return <p className="text-red-500">Failed to parse analysis result.</p>;
            }
          })()}
        </div>
      )}

      {/* Saved Reports Section */}
      {savedReports.length > 0 && (
        <div className="w-full max-w-4xl mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Previous Analyses</h2>
            <button
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
                const parsed = JSON.parse(report.content);
                return (
                  <div key={report.id} className="bg-white p-4 rounded-lg shadow text-sm">
                    <p><strong>Score:</strong> {parsed.similarity_score}%</p>
                    <p><strong>Matches:</strong> {parsed.matching_keywords.slice(0, 5).join(', ')}...</p>
                    <p><strong>Missing:</strong> {parsed.missing_keywords.slice(0, 3).join(', ')}...</p>
                    <p><strong>Tip:</strong> {parsed.actionable_recommendations[0]}</p>
                  </div>
                );
              } catch {
                return <pre key={report.id} className="bg-white p-4 rounded-lg shadow">{report.content}</pre>;
              }
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-sm text-gray-500">
        Built with ❤️ by CareerTuners
      </footer>

    </div>
  );
}

export default App;
