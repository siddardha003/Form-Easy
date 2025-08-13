import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formService } from '../services/formService';
import { CategorizeQuestionPreview } from '../components/CategorizeQuestion';
import { ComprehensionQuestionPreview } from '../components/ComprehensionQuestion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Lock
} from 'lucide-react';

const PublicForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await formService.getPublicForm(id);
      if (response.success) {
        setForm(response.data.form);
        // Initialize responses object
        const initialResponses = {};
        response.data.form.questions.forEach(q => {
          if (q.type === 'mca') {
            initialResponses[q.id] = [];
          } else if (q.type === 'cloze') {
            // Initialize for all blanks in cloze questions
            const text = q.config?.text || '';
            const blanks = text.match(/\{\{[^}]+\}\}/g) || [];
            blanks.forEach((_, index) => {
              initialResponses[`${q.id}-blank-${index}`] = '';
            });
          } else if (q.type === 'categorize') {
            // Initialize for all items in categorize questions
            const items = q.config?.items || [];
            items.forEach(item => {
              initialResponses[`${q.id}-${item.id}`] = '';
            });
          } else if (q.type === 'comprehension') {
            // Initialize for all sub-questions in comprehension questions
            const subQuestions = q.config?.subQuestions || [];
            subQuestions.forEach(subQ => {
              initialResponses[`${q.id}-${subQ.id}`] = subQ.type === 'mca' ? [] : '';
            });
          } else {
            initialResponses[q.id] = '';
          }
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
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const validateResponses = () => {
    const newErrors = {};
    
    form.questions.forEach(question => {
      if (question.required) {
        let isValid = false;
        
        switch (question.type) {
          case 'mcq':
            isValid = responses[question.id] && responses[question.id].trim() !== '';
            break;
            
          case 'mca':
            isValid = Array.isArray(responses[question.id]) && responses[question.id].length > 0;
            break;
            
          case 'cloze':
            // Check all blanks are filled
            const text = question.config?.text || '';
            const blanks = text.match(/\{\{[^}]+\}\}/g) || [];
            isValid = blanks.every((_, index) => {
              const blankResponse = responses[`${question.id}-blank-${index}`];
              return blankResponse && blankResponse.trim() !== '';
            });
            break;
            
          case 'categorize':
            // Check all items are categorized
            const items = question.config?.items || [];
            isValid = items.every(item => {
              const itemResponse = responses[`${question.id}-${item.id}`];
              return itemResponse && itemResponse.trim() !== '';
            });
            break;
            
          case 'comprehension':
            // Check all sub-questions are answered
            const subQuestions = question.config?.subQuestions || [];
            isValid = subQuestions.every(subQ => {
              const subResponse = responses[`${question.id}-${subQ.id}`];
              if (subQ.type === 'mca') {
                return Array.isArray(subResponse) && subResponse.length > 0;
              }
              return subResponse && subResponse.trim() !== '';
            });
            break;
            
          default:
            isValid = responses[question.id] && responses[question.id].toString().trim() !== '';
        }
        
        if (!isValid) {
          newErrors[question.id] = 'This field is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateResponses()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Transform responses to the format expected by backend
      const answers = [];
      
      form.questions.forEach(question => {
        switch (question.type) {
          case 'mcq':
            if (responses[question.id]) {
              answers.push({
                questionId: question.id,
                answer: responses[question.id]
              });
            }
            break;
            
          case 'mca':
            if (responses[question.id] && responses[question.id].length > 0) {
              answers.push({
                questionId: question.id,
                answer: responses[question.id]
              });
            }
            break;
            
          case 'cloze':
            // Collect all blank answers
            const text = question.config?.text || '';
            const blanks = text.match(/\{\{[^}]+\}\}/g) || [];
            const blankAnswers = {};
            blanks.forEach((_, index) => {
              const blankResponse = responses[`${question.id}-blank-${index}`];
              if (blankResponse) {
                blankAnswers[`blank-${index}`] = blankResponse;
              }
            });
            if (Object.keys(blankAnswers).length > 0) {
              answers.push({
                questionId: question.id,
                answer: blankAnswers
              });
            }
            break;
            
          case 'categorize':
            // Collect all item categorizations
            const items = question.config?.items || [];
            const categorizations = {};
            items.forEach(item => {
              const itemResponse = responses[`${question.id}-${item.id}`];
              if (itemResponse) {
                categorizations[item.id] = itemResponse;
              }
            });
            if (Object.keys(categorizations).length > 0) {
              answers.push({
                questionId: question.id,
                answer: categorizations
              });
            }
            break;
            
          case 'comprehension':
            // Collect all sub-question answers
            const subQuestions = question.config?.subQuestions || [];
            const subAnswers = {};
            subQuestions.forEach(subQ => {
              const subResponse = responses[`${question.id}-${subQ.id}`];
              if (subResponse) {
                subAnswers[subQ.id] = subResponse;
              }
            });
            if (Object.keys(subAnswers).length > 0) {
              answers.push({
                questionId: question.id,
                answer: subAnswers
              });
            }
            break;
            
          default:
            if (responses[question.id]) {
              answers.push({
                questionId: question.id,
                answer: responses[question.id]
              });
            }
        }
      });
      
      const responseData = {
        formId: id,
        answers: answers,
        startedAt: new Date().toISOString(),
        totalTimeSpent: 0 // You can implement time tracking if needed
      };
      
      console.log('📤 Submitting response data:', responseData);
      console.log('🔑 Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await formService.submitResponse(responseData);
      if (response.success) {
        setSubmitted(true);
        toast.success('Response submitted successfully!');
      } else {
        toast.error(response.error?.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('💥 Error submitting response:', error);
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Failed to submit response');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const hasError = errors[question.id];

    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.config.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={responses[question.id] === option.id}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'mca':
        return (
          <div className="space-y-3">
            {question.config.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={(responses[question.id] || []).includes(option.id)}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    const newValues = e.target.checked 
                      ? [...currentValues, option.id]
                      : currentValues.filter(id => id !== option.id);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700 flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'cloze':
        const blankIndex = { value: 0 };
        return (
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
                      value={responses[blankKey] || ''}
                      onChange={(e) => handleResponseChange(blankKey, e.target.value)}
                      className="inline-block mx-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[120px]"
                      placeholder="Your answer"
                    />
                  );
                }
                return <span key={`text-${partIndex}`}>{part}</span>;
              })
              : null
            }
          </div>
        );

      case 'categorize':
        return (
          <div className="space-y-4">
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
            />
          </div>
        );

      case 'comprehension':
        return (
          <div className="space-y-4">
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
            />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-500 italic">This question type is not supported yet.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600">The form you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!form.settings?.isPublished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h2>
          <p className="text-gray-600">This form is currently not published and cannot be accessed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
            {/* Form Title & Description */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
              {form.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{form.description}</p>
              )}
            </div>

            {/* Form Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Est. time: 5-10 minutes</span>
              </div>
              {form.settings?.deadline && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Deadline: {new Date(form.settings.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{form.questions.length} questions</span>
              </div>
            </div>

            {/* Progress Bar */}
            {form.settings?.showProgressBar && form.questions.length > 1 && (
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-8">
              {form.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start space-x-4">
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
                      
                      {errors[question.id] && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors[question.id]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white py-4 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Your response will be recorded securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;
