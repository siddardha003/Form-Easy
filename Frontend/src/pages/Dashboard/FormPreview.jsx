import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../../services/formService';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { CategorizeQuestionPreview } from '../../components/CategorizeQuestion';
import { ComprehensionQuestionPreview } from '../../components/ComprehensionQuestion';
import { 
  ArrowLeft, 
  Eye, 
  ExternalLink, 
  Share2, 
  QrCode,
  Copy,
  Download,
  Settings
} from 'lucide-react';

const FormPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await formService.getForm(id);
      if (response.success) {
        setForm(response.data.form);
        // Initialize responses object
        const initialResponses = {};
        response.data.form.questions.forEach(q => {
          initialResponses[q.id] = '';
        });
        setResponses(initialResponses);
      }
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Form link copied to clipboard!');
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div key={question.id} className="space-y-4">
            <div className="space-y-3">
              {question.config.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'mca':
        return (
          <div key={question.id} className="space-y-4">
            <div className="space-y-3">
              {question.config.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.id}
                    onChange={(e) => {
                      const currentValues = responses[question.id] || [];
                      const newValues = e.target.checked 
                        ? [...currentValues, option.id]
                        : currentValues.filter(id => id !== option.id);
                      handleResponseChange(question.id, newValues);
                    }}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'cloze':
        const blankIndex = { value: 0 };
        return (
          <div key={question.id} className="space-y-4">
            <div className="text-lg leading-relaxed">
              {question.config?.text ? 
                question.config.text.split(/(\{\{[^}]+\}\})/).map((part, partIndex) => {
                  if (part.match(/\{\{[^}]+\}\}/)) {
                    const currentBlankIndex = blankIndex.value++;
                    const blankKey = `${question.id}-blank-${currentBlankIndex}`;
                    return (
                      <input
                        key={blankKey}
                        type="text"
                        className="inline-block mx-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[120px]"
                        placeholder="Your answer"
                        onChange={(e) => handleResponseChange(blankKey, e.target.value)}
                      />
                    );
                  }
                  return <span key={`text-${partIndex}`}>{part}</span>;
                })
                : null
              }
            </div>
          </div>
        );

      case 'comprehension':
        return (
          <div key={question.id} className="space-y-4">
            <ComprehensionQuestionPreview
              passage={question.config?.passage || ''}
              subQuestions={question.config?.subQuestions || []}
              onResponseChange={(subQuestionId, value) => {
                handleResponseChange(`${question.id}-${subQuestionId}`, value);
              }}
              responses={Object.fromEntries(
                Object.entries(responses)
                  .filter(([key]) => key.startsWith(`${question.id}-`))
                  .map(([key, value]) => [key.replace(`${question.id}-`, ''), value])
              )}
              disabled={true}
            />
          </div>
        );

      case 'image':
        return (
          <div key={question.id} className="space-y-4">
            {question.config?.questionImage && (
              <div className="mb-4">
                <img 
                  src={question.config.questionImage.url || question.config.questionImage.secure_url} 
                  alt="Question" 
                  className="max-w-md rounded-lg shadow-sm"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm">
                    {question.config?.allowMultipleImages ? 
                      `Upload up to ${question.config.maxImages || 3} images` : 
                      'Upload an image'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>

              {question.config?.requiresTextAnswer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder={question.config.textPlaceholder || 'Describe what you see...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'categorize':
        return (
          <div key={question.id} className="space-y-4">
            <CategorizeQuestionPreview
              categories={question.config?.categories || []}
              items={question.config?.items || []}
              onResponseChange={(itemId, categoryId) => {
                handleResponseChange(`${question.id}-${itemId}`, categoryId);
              }}
              responses={Object.fromEntries(
                Object.entries(responses)
                  .filter(([key]) => key.startsWith(`${question.id}-`))
                  .map(([key, value]) => [key.replace(`${question.id}-`, ''), value])
              )}
              disabled={true}
            />
          </div>
        );

      default:
        return (
          <div key={question.id} className="text-gray-500 italic">
            Question type not supported in preview
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form preview...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
          <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Form Preview</h1>
                <p className="text-sm text-gray-500">{form.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={copyFormLink}
                className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </button>
              <button
                onClick={() => window.open(`/form/${id}`, '_blank')}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Public Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          {form.headerImage && (
            <div className="h-48 bg-gray-200">
              <img 
                src={form.headerImage.url || form.headerImage.secure_url || form.headerImage} 
                alt="Form header" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
              {form.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{form.description}</p>
              )}
            </div>

            {/* Progress Bar */}
            {form.settings.showProgressBar && form.questions.length > 1 && (
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentPage + 1) / form.questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentPage + 1) / form.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-8">
              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {question.description && (
                        <p className="text-gray-600 mb-4">{question.description}</p>
                      )}
                      {question.image && (
                        <div className="mb-4">
                          <img 
                            src={question.image.url || question.image.secure_url || question.image} 
                            alt="Question" 
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                      {renderQuestion(question, index)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Submit Response (Preview Mode)
              </button>
              <p className="text-sm text-gray-500 text-center mt-2">
                This is a preview. Responses won't be saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
