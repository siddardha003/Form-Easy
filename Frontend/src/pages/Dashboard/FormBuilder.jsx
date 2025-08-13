import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formService } from '../../services/formService';
import { toast } from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { CategorizeQuestionBuilder } from '../../components/CategorizeQuestion';
import { ComprehensionQuestionBuilder } from '../../components/ComprehensionQuestion';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  Trash2,
  Copy,
  ChevronDown,
  Calendar,
  Users,
  Award
} from 'lucide-react';

// Helper components for cloze questions
const ClozePreview = ({ text }) => {
  try {
    if (!text) {
      return <span className="text-gray-400 italic">Enter text with blanks above to see preview</span>;
    }

    const parts = text.split(/(\{\{[^}]+\}\})/);
    
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            const blankText = part.slice(2, -2).trim();
            return (
              <span 
                key={`blank-${index}`}
                className="inline-block bg-blue-100 border-2 border-dashed border-blue-300 px-3 py-1 mx-1 rounded"
              >
                {blankText || '______'}
              </span>
            );
          }
          return <span key={`text-${index}`}>{part}</span>;
        })}
      </div>
    );
  } catch (error) {
    console.error('Cloze preview error:', error);
    return <span className="text-red-500">Error rendering preview</span>;
  }
};

const BlankConfig = ({ blank, index, onUpdate }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900">
          Blank {index + 1}: "{blank.blankText || '______'}"
        </h5>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={blank.caseSensitive || false}
            onChange={(e) => onUpdate({
              ...blank,
              caseSensitive: e.target.checked
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          Case sensitive
        </label>
      </div>
      
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Correct answers (one per line):
        </label>
        <textarea
          value={blank.correctAnswers?.join('\n') || ''}
          onChange={(e) => onUpdate({
            ...blank,
            correctAnswers: e.target.value.split('\n').filter(a => a.trim())
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Paris&#10;paris&#10;PARIS"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add multiple correct answers (one per line) to allow variations
        </p>
      </div>
    </div>
  );
};

// Main ClozeEditor component with improved state management
const ClozeEditor = ({ config, onUpdate }) => {
  const [text, setText] = useState(config?.text || '');
  const [blanks, setBlanks] = useState(config?.blanks || []);
  
  // Parse blanks from text whenever it changes
  useEffect(() => {
    try {
      if (!text.trim()) {
        setBlanks([]);
        return;
      }

      const blankRegex = /\{\{([^}]+)\}\}/g;
      const newBlanks = [];
      let match;
      let index = 0;
      
      // Reset regex state
      blankRegex.lastIndex = 0;
      
      while ((match = blankRegex.exec(text)) !== null) {
        const blankText = match[1].trim();
        const existingBlank = blanks[index] || {};
        
        newBlanks.push({
          id: existingBlank.id || `blank-${Date.now()}-${index}`,
          correctAnswers: existingBlank.correctAnswers?.length > 0 ? existingBlank.correctAnswers : [blankText],
          caseSensitive: existingBlank.caseSensitive || false,
          blankText,
          position: index
        });
        
        index++;
      }
      
      // Only update if blanks actually changed
      if (JSON.stringify(newBlanks) !== JSON.stringify(blanks)) {
        setBlanks(newBlanks);
      }
    } catch (error) {
      console.error('Error parsing blanks:', error);
      setBlanks([]);
    }
  }, [text]);

  // Update parent config when changes occur
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onUpdate({
        ...config,
        text,
        blanks
      });
    }, 300); // Debounce updates to prevent excessive re-renders

    return () => clearTimeout(debounceTimeout);
  }, [text, blanks]);

  // Handle blank configuration changes
  const updateBlank = (id, updates) => {
    setBlanks(prev => prev.map(blank => 
      blank.id === id ? { ...blank, ...updates } : blank
    ));
  };

  // Render the preview safely
  const renderPreview = () => {
    try {
      if (!text) {
        return <span className="text-gray-400 italic">Enter text with blanks above to see preview</span>;
      }

      const parts = text.split(/(\{\{[^}]+\}\})/);
      
      return parts.map((part, index) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const blankText = part.slice(2, -2).trim();
          return (
            <span 
              key={`blank-${index}`}
              className="inline-block bg-blue-100 border-2 border-dashed border-blue-300 px-3 py-1 mx-1 rounded"
            >
              {blankText}
            </span>
          );
        }
        return <span key={`text-${index}`}>{part}</span>;
      });
    } catch (error) {
      console.error('Preview rendering error:', error);
      return <span className="text-red-500">Error rendering preview</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text with blanks (use {'{{}}'} for blanks)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Example: The capital of France is {{Paris}} and it is known for the {{Eiffel Tower}}."
        />
      </div>
      
      {/* Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="text-lg leading-relaxed">
          {renderPreview()}
        </div>
      </div>

      {/* Blank Configuration */}
      {blanks.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Blank Answers:</h4>
          <div className="space-y-3">
            {blanks.map((blank, index) => (
              <div key={blank.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">
                    Blank {index + 1}: "{blank.blankText}"
                  </h5>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={blank.caseSensitive || false}
                      onChange={(e) => updateBlank(blank.id, { caseSensitive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    Case sensitive
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Correct answers (one per line):
                  </label>
                  <textarea
                    value={blank.correctAnswers?.join('\n') || ''}
                    onChange={(e) => {
                      const answers = e.target.value.split('\n')
                        .map(a => a.trim())
                        .filter(a => a);
                      updateBlank(blank.id, { correctAnswers: answers.length > 0 ? answers : [''] });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Paris&#10;paris&#10;PARIS"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add multiple correct answers (one per line) to allow variations
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
          No blanks detected. Add blanks using {'{{}}'} syntax to configure answers.
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Cloze Questions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use {'{{}}'} to create blanks: The {{answer}} is correct</li>
          <li>• Add multiple correct answers for flexibility</li>
          <li>• Use case-sensitive option for exact matching</li>
          <li>• Keep blanks meaningful and not too obvious</li>
        </ul>
      </div>
    </div>
  );
};

const FormBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: '',
    headerImage: null,
    questions: [],
    settings: {
      isPublished: false,
      allowAnonymous: true,
      collectEmail: false,
      showProgressBar: true,
      deadline: null,
      maxResponses: null,
      requireSignup: false
    }
  });

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing form if editing
  useEffect(() => {
    if (isEditing && id) {
      loadForm();
    }
  }, [id, isEditing]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await formService.getForm(id);
      if (response.success) {
        setForm(response.data.form);
        // Set first question as active if exists
        if (response.data.form.questions.length > 0) {
          setActiveQuestion(response.data.form.questions[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Failed to load form');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { id: 'mcq', label: 'Multiple Choice (Single)', icon: '●', description: 'Single correct answer' },
    { id: 'mca', label: 'Multiple Choice (Multiple)', icon: '☑', description: 'Multiple correct answers' },
    { id: 'cloze', label: 'Cloze (Fill in blanks)', icon: '___', description: 'Fill in the missing words' },
    { id: 'categorize', label: 'Categorize', icon: '📂', description: 'Drag items into categories' },
    { id: 'comprehension', label: 'Comprehension', icon: '📖', description: 'Reading passage with questions' },
    { id: 'image', label: 'Image Question', icon: '🖼️', description: 'Question with image upload' }
  ];

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      title: `Question ${form.questions.length + 1}`,
      description: '',
      image: null,
      required: true,
      points: 1,
      config: getDefaultConfig(type)
    };

    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setActiveQuestion(newQuestion.id);
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'mcq':
        return {
          options: [
            { id: '1', text: 'Option 1', isCorrect: false },
            { id: '2', text: 'Option 2', isCorrect: false }
          ]
        };
      case 'mca':
        return {
          options: [
            { id: '1', text: 'Option 1', isCorrect: false },
            { id: '2', text: 'Option 2', isCorrect: false }
          ]
        };
      case 'cloze':
        return {
          text: 'The capital of France is {{Paris}}.',
          blanks: [
            { 
              id: `blank-${Date.now()}-1`, 
              correctAnswers: ['Paris'], 
              caseSensitive: false,
              blankText: 'Paris'
            }
          ],
          showBlanksPreview: true
        };
      case 'categorize':
        return {
          categories: [
            { id: '1', label: 'Category 1', color: '#3B82F6' },
            { id: '2', label: 'Category 2', color: '#10B981' }
          ],
          items: [
            { id: '1', text: 'Item 1', correctCategory: '1' },
            { id: '2', text: 'Item 2', correctCategory: '2' }
          ]
        };
      case 'comprehension':
        return {
          passage: 'Enter your reading passage here...',
          subQuestions: [
            {
              id: '1',
              type: 'mcq',
              question: 'Question about the passage',
              options: [
                { id: '1', text: 'Option 1', isCorrect: false },
                { id: '2', text: 'Option 2', isCorrect: false }
              ]
            }
          ]
        };
      case 'image':
        return {
          questionImage: null,
          allowMultipleImages: false,
          maxImages: 1,
          requiresTextAnswer: false,
          textPlaceholder: 'Describe what you see...'
        };
      default:
        return {};
    }
  };

  const updateQuestion = (questionId, updates) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (questionId) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    setActiveQuestion(null);
  };

  const duplicateQuestion = (questionId) => {
    const question = form.questions.find(q => q.id === questionId);
    if (question) {
      const newQuestion = {
        ...question,
        id: Date.now().toString(),
        title: `${question.title} (Copy)`
      };
      setForm(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      
      if (isEditing) {
        const response = await formService.updateForm(id, form);
        if (response.success) {
          toast.success('Form updated successfully!');
        }
      } else {
        const response = await formService.createForm(form);
        if (response.success) {
          toast.success('Form created successfully!');
          // Navigate to edit mode with the new form ID
          navigate(`/forms/builder/${response.data.form._id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    try {
      // First save the form
      await saveForm();
      
      // Then publish it
      if (form.questions.length === 0) {
        toast.error('Cannot publish form without questions');
        return;
      }

      const formId = id || form._id;
      if (formId) {
        const response = await formService.togglePublish(formId, true);
        if (response.success) {
          setForm(prev => ({
            ...prev,
            settings: { ...prev.settings, isPublished: true }
          }));
          toast.success('Form published successfully!');
        }
      }
    } catch (error) {
      console.error('Error publishing form:', error);
      toast.error('Failed to publish form');
    }
  };

  const renderQuestionEditor = () => {
    const question = form.questions.find(q => q.id === activeQuestion);
    if (!question) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Question Header */}
          <div>
            <input
              type="text"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              className="text-lg font-semibold w-full border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              placeholder="Question title"
            />
            <textarea
              value={question.description}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
              className="w-full mt-2 text-gray-600 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 resize-none"
              placeholder="Question description (optional)"
              rows="2"
            />
          </div>

          {/* Question Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Question Image (Optional)
            </label>
            <ImageUpload
              currentImage={question.image}
              onImageUpload={(image) => {
                updateQuestion(question.id, { image });
              }}
              className="max-w-md"
            />
          </div>

          {/* Question Type Specific Editor */}
          {renderQuestionTypeEditor(question)}

          {/* Question Settings */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>
                
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Points:</span>
                  <input
                    type="number"
                    min="0"
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => duplicateQuestion(question.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionTypeEditor = (question) => {
    switch (question.type) {
      case 'mcq':
      case 'mca':
        return (
          <div className="space-y-3">
            {question.config.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3">
                <input
                  type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                  name={`question-${question.id}`}
                  checked={option.isCorrect}
                  onChange={(e) => {
                    const newOptions = [...question.config.options];
                    if (question.type === 'mcq') {
                      newOptions.forEach(opt => opt.isCorrect = false);
                    }
                    newOptions[index].isCorrect = e.target.checked;
                    updateQuestion(question.id, {
                      config: { ...question.config, options: newOptions }
                    });
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...question.config.options];
                    newOptions[index].text = e.target.value;
                    updateQuestion(question.id, {
                      config: { ...question.config, options: newOptions }
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.config.options.filter(opt => opt.id !== option.id);
                    updateQuestion(question.id, {
                      config: { ...question.config, options: newOptions }
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOption = {
                  id: Date.now().toString(),
                  text: `Option ${question.config.options.length + 1}`,
                  isCorrect: false
                };
                updateQuestion(question.id, {
                  config: {
                    ...question.config,
                    options: [...question.config.options, newOption]
                  }
                });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Option
            </button>
          </div>
        );

      case 'cloze':
        return (
          <ClozeEditor
            config={question.config}
            onUpdate={(newConfig) => updateQuestion(question.id, { config: newConfig })}
          />
        );

      case 'categorize':
        return (
          <CategorizeQuestionBuilder
            config={question.config}
            onUpdate={(newConfig) => updateQuestion(question.id, { config: newConfig })}
          />
        );

      case 'comprehension':
        return (
          <ComprehensionQuestionBuilder
            config={question.config}
            onUpdate={(newConfig) => updateQuestion(question.id, { config: newConfig })}
          />
        );

      case 'image':
        return (
          <div className="space-y-6">
            {/* Question Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Question Image (Optional)
              </label>
              <ImageUpload
                currentImage={question.config.questionImage}
                onImageUpload={(image) => {
                  updateQuestion(question.id, {
                    config: { ...question.config, questionImage: image }
                  });
                }}
                className="max-w-md"
              />
            </div>

            {/* Response Settings */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900">Response Settings</h4>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`multiple-images-${question.id}`}
                  checked={question.config.allowMultipleImages || false}
                  onChange={(e) => {
                    updateQuestion(question.id, {
                      config: { 
                        ...question.config, 
                        allowMultipleImages: e.target.checked,
                        maxImages: e.target.checked ? (question.config.maxImages || 3) : 1
                      }
                    });
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`multiple-images-${question.id}`} className="text-sm text-gray-700">
                  Allow multiple images
                </label>
              </div>

              {question.config.allowMultipleImages && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Images
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={question.config.maxImages || 3}
                    onChange={(e) => {
                      updateQuestion(question.id, {
                        config: { ...question.config, maxImages: parseInt(e.target.value) }
                      });
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`requires-text-${question.id}`}
                  checked={question.config.requiresTextAnswer || false}
                  onChange={(e) => {
                    updateQuestion(question.id, {
                      config: { ...question.config, requiresTextAnswer: e.target.checked }
                    });
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`requires-text-${question.id}`} className="text-sm text-gray-700">
                  Require text description
                </label>
              </div>

              {question.config.requiresTextAnswer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Placeholder
                  </label>
                  <input
                    type="text"
                    value={question.config.textPlaceholder || ''}
                    onChange={(e) => {
                      updateQuestion(question.id, {
                        config: { ...question.config, textPlaceholder: e.target.value }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter placeholder text for description field..."
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Response Preview</h4>
              <div className="space-y-3">
                {question.config.questionImage && (
                  <div>
                    <img 
                      src={question.config.questionImage.url || question.config.questionImage.secure_url} 
                      alt="Question" 
                      className="max-w-sm rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  📁 Users will upload {question.config.allowMultipleImages ? 
                    `up to ${question.config.maxImages} images` : 
                    '1 image'
                  }
                </div>
                {question.config.requiresTextAnswer && (
                  <div>
                    <textarea
                      placeholder={question.config.textPlaceholder || 'Describe what you see...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      rows="3"
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Question type not implemented</div>;
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
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
                />
                <p className="text-sm text-gray-500">
                  {form.questions.length} question{form.questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={publishForm}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Eye className="h-4 w-4 mr-2" />
                {form.settings.isPublished ? 'Published' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Form Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Form Header</h3>
          
          {/* Header Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Header Image (Optional)
            </label>
            <ImageUpload
              currentImage={form.headerImage}
              onImageUpload={(image) => {
                setForm(prev => ({ ...prev, headerImage: image }));
              }}
              className="max-w-lg"
            />
          </div>

          {/* Form Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add a description to help users understand your form..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              
              <div className="space-y-2 mb-4">
                {form.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestion(question.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeQuestion === question.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Q{index + 1}</span>
                      <span className="text-xs text-gray-500">
                        {questionTypes.find(t => t.id === question.type)?.icon}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{question.title}</p>
                  </button>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Question</h4>
                <div className="space-y-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => addQuestion(type.id)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-3">
            {activeQuestion ? (
              renderQuestionEditor()
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No question selected</h3>
                <p className="text-gray-600 mb-6">Select a question from the left panel or add a new one to get started.</p>
                <button
                  onClick={() => addQuestion('mcq')}
                  className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add Your First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;