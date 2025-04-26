function redirectToAnalyzer() {
    const hostname = window.location.hostname;
  
    if (hostname === 'localhost') {
      window.location.href = 'http://localhost:5173/';
    } else {
      window.location.href = 'https://resume-analyzer-dov.pages.dev/';
    }
  }
  