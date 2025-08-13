import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple test components
const TestHome = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          BustBrain Labs
        </span>
      </h1>
      <p className="text-lg text-gray-600 mb-8">Form Builder Application</p>
      <div className="space-y-4">
        <Link 
          to="/test-signin" 
          className="block bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Test Sign In
        </Link>
        <Link 
          to="/test-dashboard" 
          className="block border-2 border-blue-500 text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all"
        >
          Test Dashboard
        </Link>
      </div>
    </div>
  </div>
);

const TestSignin = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test Sign In</h2>
      <p className="text-gray-600 mb-4">This is a test sign in page</p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </div>
  </div>
);

const TestDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">Test Dashboard</h1>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-gray-600 mb-4">This is a test dashboard page</p>
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="/test-signin" element={<TestSignin />} />
        <Route path="/test-dashboard" element={<TestDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;