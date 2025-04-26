import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setResumeFile(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const analyzeWithGPT = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('https://analyze-gpt.contact-cb5.workers.dev/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeFile, jobDescription }),
      });

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-section');
    html2pdf().from(element).save('resume-analysis-report.pdf');
  };

  return (
    <div className="flex min-h-screen font-poppins bg-[#F5F7FC] p-6 gap-6">

      {/* Sidebar */}
      <aside className="w-1/3 flex flex-col gap-6">

        {/* Upload Resume Box */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Upload Resume</h2>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleResumeUpload}
            className="w-full text-sm border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Paste JD Box */}
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Paste Job Description</h2>
          <textarea
            rows="6"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            placeholder="Paste the job description here..."
          />
          <button
            onClick={analyzeWithGPT}
            className="bg-[#6184B3] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition w-full"
          >
            Start Analysis
          </button>
        </div>

      </aside>

      {/* Main Report Area */}
      <main className="w-2/3 bg-white p-8 rounded-2xl shadow-lg overflow-y-auto" id="analysis-section">

        {loading ? (
          <div className="flex flex-col justify-center items-center h-full animate-pulse">
            <div className="text-2xl font-bold text-gray-400 mb-4">Analyzing Resume...</div>
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : analysisResult ? (
          <div className="space-y-10">

            {/* Matched Keywords */}
            <Section title="Matched Keywords">
              {analysisResult.matched_keywords.map((kw, idx) => (
                <Badge key={idx} text={kw} color="green" />
              ))}
            </Section>

            {/* Matched Skills */}
            <Section title="Matched Skills">
              {analysisResult.matched_skills.map((skill, idx) => (
                <Badge key={idx} text={skill} color="blue" />
              ))}
            </Section>

            {/* Missing Keywords */}
            <Section title="Missing Keywords">
              {analysisResult.missing_keywords.map((kw, idx) => (
                <Badge key={idx} text={kw} color="red" />
              ))}
            </Section>

            {/* Missing Skills */}
            <Section title="Missing Skills">
              {analysisResult.missing_skills.map((skill, idx) => (
                <Badge key={idx} text={skill} color="yellow" />
              ))}
            </Section>

            {/* Content Structure */}
            <Section title="Content Structure">
              <p className="text-gray-800">{analysisResult.content_structure_comments}</p>
            </Section>

            {/* Sections Analysis */}
            <Section title="Sections Analysis">
              <p className="text-green-700 mb-2">Present: {analysisResult.sections_analysis.present_sections.join(', ')}</p>
              <p className="text-red-600">Missing: {analysisResult.sections_analysis.missing_sections.join(', ')}</p>
            </Section>

            {/* Communication Style */}
            <Section title="Communication Style">
              <p className="text-gray-800">{analysisResult.communication_style}</p>
            </Section>

            {/* Final Recommendations */}
            <Section title="Final Recommendations">
              <ul className="list-disc pl-6 text-gray-800">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </Section>

            {/* Download PDF Button */}
            <div className="text-center">
              <button
                onClick={handleDownloadPDF}
                className="bg-[#6184B3] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition mt-8"
              >
                Download Full Report
              </button>
            </div>

          </div>
        ) : (
          <div className="text-gray-400 text-center mt-32">
            Please upload your resume and job description to start analysis.
          </div>
        )}
      </main>

    </div>
  );
}

// Reusable Section Component
const Section = ({ title, children }) => (
  <section className="bg-[#DEE5EF] p-6 rounded-2xl shadow-md">
    <h2 className="text-xl font-bold text-black mb-4">{title}</h2>
    {children}
  </section>
);

// Reusable Badge Component
const Badge = ({ text, color }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors[color]} mr-2 mb-2`}>
      {text}
    </span>
  );
};

export default App;
