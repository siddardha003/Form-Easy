import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formService } from '../../services/formService';
import {
  Home,
  FolderOpen,
  BarChart3,
  LogOut,
  User,
  FileText,
  Eye,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    totalViews: 0,
    avgResponseRate: 0
  });

  // Load forms and stats on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const formsData = await formService.getForms();

      if (formsData.success) {
        setForms(formsData.data.forms || []);

        // Calculate stats from forms data
        const totalForms = formsData.data.forms?.length || 0;
        const totalResponses = formsData.data.forms?.reduce((sum, form) => sum + (form.analytics?.totalSubmissions || 0), 0) || 0;
        const totalViews = formsData.data.forms?.reduce((sum, form) => sum + (form.analytics?.totalViews || 0), 0) || 0;
        const avgResponseRate = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0;

        setStats({
          totalForms,
          totalResponses,
          totalViews,
          avgResponseRate
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formService.deleteForm(formId);
        toast.success('Form deleted successfully');
        loadDashboardData(); // Reload data
      } catch (error) {
        toast.error('Failed to delete form');
      }
    }
  };

  const handleDuplicateForm = async (formId) => {
    try {
      await formService.duplicateForm(formId);
      toast.success('Form duplicated successfully');
      loadDashboardData(); // Reload data
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
  };

  const handleTogglePublish = async (formId, currentStatus) => {
    try {
      await formService.togglePublish(formId, !currentStatus);
      toast.success(`Form ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      loadDashboardData(); // Reload data
    } catch (error) {
      toast.error('Failed to update form status');
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'My Workspace', icon: FolderOpen },
    { id: 'responses', label: 'Responses', icon: BarChart3 }
  ];

  const renderHome = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your forms today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {forms.length > 0 ? (
            forms.slice(0, 3).map((form) => (
              <div key={form.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{form.title}</p>
                    <p className="text-sm text-gray-600">
                      {form.responses || 0} responses • 
                      {form.lastResponse ? ` Last: ${form.lastResponse}` : ' No responses yet'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {form.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No forms created yet</p>
              <button
                onClick={() => navigate('/forms/builder')}
                className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Create Your First Form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWorkspace = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Workspace</h1>
          <p className="text-gray-600 mt-2">Manage all your forms in one place.</p>
        </div>
        <button
          onClick={() => navigate('/forms/builder')}
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.length > 0 ? (
          forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{form.responses || 0} responses</span>
                    <span>{form.views || 0} views</span>
                    <button
                      onClick={() => handleTogglePublish(form.id, form.isPublished)}
                      className={`px-2 py-1 rounded-full cursor-pointer hover:shadow-sm transition-all ${form.isPublished
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                      {form.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate(`/forms/builder/${form.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Form"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/forms/preview/${form.id}`)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Preview Form"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDuplicateForm(form.id)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Duplicate Form"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/form/${form.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Form link copied to clipboard!');
                    }}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Copy Public Link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Form"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No forms in your workspace yet</p>
            <p className="text-gray-400 mb-6">Create your first form to get started</p>
            <button
              onClick={() => navigate('/forms/builder')}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Form
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Responses</h1>
        <p className="text-gray-600 mt-2">View and analyze responses from your forms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.filter(form => (form.responses || 0) > 0).length > 0 ? (
          forms.filter(form => (form.responses || 0) > 0).map((form) => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {form.responses || 0} responses
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{form.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">
                    {form.views > 0 ? Math.round(((form.responses || 0) / form.views) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Response</span>
                  <span className="font-medium">{form.lastResponse || 'N/A'}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/reports')}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                View Responses
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No responses yet</p>
            <p className="text-gray-400 mb-6">Share your forms to start collecting responses</p>
            <button
              onClick={() => setActiveTab('workspace')}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              View My Forms
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'workspace':
        return renderWorkspace();
      case 'responses':
        return renderResponses();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
            BustBrain Labs
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-end">
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="font-medium">{user.firstName} {user.lastName}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;