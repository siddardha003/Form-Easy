import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formService } from '../../services/formService';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Download,
  Filter,
  Calendar,
  PieChart,
  Activity,
  FileText
} from 'lucide-react';

const Reports = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadFormAnalytics(selectedForm.id);
      loadFormResponses(selectedForm.id);
    }
  }, [selectedForm, timeRange]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getForms();
      if (response.success) {
        setForms(response.data.forms || []);
        if (response.data.forms.length > 0) {
          setSelectedForm(response.data.forms[0]);
        }
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const loadFormAnalytics = async (formId) => {
    try {
      // Mock analytics data since we don't have the backend endpoint yet
      const mockAnalytics = {
        totalResponses: Math.floor(Math.random() * 100) + 10,
        totalViews: Math.floor(Math.random() * 500) + 50,
        responseRate: Math.random() * 40 + 10,
        avgCompletionTime: Math.floor(Math.random() * 300) + 60,
        responsesByDay: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responses: Math.floor(Math.random() * 20)
        })),
        questionAnalytics: selectedForm?.questions.map(q => ({
          questionId: q.id,
          questionTitle: q.title,
          type: q.type,
          totalResponses: Math.floor(Math.random() * 80) + 5,
          averageScore: q.type === 'mcq' || q.type === 'mca' ? Math.random() * 100 : null
        })) || []
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadFormResponses = async (formId) => {
    try {
      // Mock responses data
      const mockResponses = Array.from({ length: analytics?.totalResponses || 10 }, (_, i) => ({
        id: `response-${i}`,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        answers: selectedForm?.questions.reduce((acc, q) => {
          acc[q.id] = q.type === 'mcq' ? 'Option 1' : q.type === 'mca' ? ['Option 1', 'Option 2'] : 'Sample answer';
          return acc;
        }, {}) || {}
      }));
      setResponses(mockResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500">View form performance and response data</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Select Form</h3>
              <div className="space-y-2">
                {forms.map((form) => (
                  <button
                    key={form._id}
                    onClick={() => setSelectedForm(form)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedForm?._id === form._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{form.title}</span>
                      <span className="text-xs text-gray-500">
                        {form.settings?.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedForm && analytics ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Users}
                    label="Total Responses"
                    value={analytics.totalResponses}
                    change={12}
                    color="blue"
                  />
                  <StatCard
                    icon={Eye}
                    label="Total Views"
                    value={analytics.totalViews}
                    change={8}
                    color="green"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Response Rate"
                    value={`${analytics.responseRate.toFixed(1)}%`}
                    change={-2}
                    color="purple"
                  />
                  <StatCard
                    icon={Activity}
                    label="Avg. Time"
                    value={`${Math.floor(analytics.avgCompletionTime / 60)}m ${analytics.avgCompletionTime % 60}s`}
                    change={5}
                    color="orange"
                  />
                </div>

                {/* Response Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Trend</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {analytics.responsesByDay.map((day, index) => (
                      <div key={day.date} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm"
                          style={{ height: `${(day.responses / 20) * 100}%`, minHeight: '4px' }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Analytics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Question</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Responses</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.questionAnalytics.map((q, index) => (
                          <tr key={q.questionId} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{q.questionTitle}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600 capitalize">{q.type}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">{q.totalResponses}</span>
                            </td>
                            <td className="py-3 px-4">
                              {q.averageScore ? (
                                <span className="text-sm text-gray-900">{q.averageScore.toFixed(1)}%</span>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Responses */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Responses</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Responses</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses.slice(0, 5).map((response) => (
                          <tr key={response.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">
                                {response.submittedAt.toLocaleDateString()} {response.submittedAt.toLocaleTimeString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {Object.keys(response.answers).length} answers
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-blue-600 hover:text-blue-700 text-sm">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Selected</h3>
                <p className="text-gray-600">Select a form from the sidebar to view its analytics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
