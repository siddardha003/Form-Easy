import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Component for the form builder - editing comprehension questions
export const ComprehensionQuestionBuilder = ({ config, onUpdate }) => {
  const [passage, setPassage] = useState(config?.passage || '');
  const [subQuestions, setSubQuestions] = useState(config?.subQuestions || []);

  useEffect(() => {
    onUpdate({
      ...config,
      passage,
      subQuestions
    });
  }, [passage, subQuestions]);

  const addSubQuestion = (type = 'mcq') => {
    const newSubQuestion = {
      id: `subq-${Date.now()}`,
      type,
      question: 'Question about the passage',
      points: 1,
      ...(type === 'mcq' || type === 'multiple-choice' ? {
        options: [
          { id: '1', text: 'Option 1', isCorrect: false },
          { id: '2', text: 'Option 2', isCorrect: false },
          { id: '3', text: 'Option 3', isCorrect: false },
          { id: '4', text: 'Option 4', isCorrect: false }
        ]
      } : type === 'true-false' ? {
        correctAnswer: true
      } : type === 'short-answer' ? {
        correctAnswers: ['Sample answer'],
        caseSensitive: false,
        maxLength: 200
      } : {})
    };
    setSubQuestions([...subQuestions, newSubQuestion]);
  };

  const updateSubQuestion = (id, updates) => {
    setSubQuestions(subQuestions.map(subQ => 
      subQ.id === id ? { ...subQ, ...updates } : subQ
    ));
  };

  const deleteSubQuestion = (id) => {
    setSubQuestions(subQuestions.filter(subQ => subQ.id !== id));
  };

  const addOption = (subQuestionId) => {
    const subQuestion = subQuestions.find(subQ => subQ.id === subQuestionId);
    if (!subQuestion || !subQuestion.options) return;

    const newOption = {
      id: Date.now().toString(),
      text: `Option ${subQuestion.options.length + 1}`,
      isCorrect: false
    };

    updateSubQuestion(subQuestionId, {
      options: [...subQuestion.options, newOption]
    });
  };

  const updateOption = (subQuestionId, optionId, updates) => {
    const subQuestion = subQuestions.find(subQ => subQ.id === subQuestionId);
    if (!subQuestion) return;

    const newOptions = subQuestion.options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    updateSubQuestion(subQuestionId, { options: newOptions });
  };

  const deleteOption = (subQuestionId, optionId) => {
    const subQuestion = subQuestions.find(subQ => subQ.id === subQuestionId);
    if (!subQuestion || subQuestion.options.length <= 2) return;

    const newOptions = subQuestion.options.filter(opt => opt.id !== optionId);
    updateSubQuestion(subQuestionId, { options: newOptions });
  };

  const renderSubQuestionEditor = (subQuestion, index) => {
    return (
      <div key={subQuestion.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
          <div className="flex items-center space-x-2">
            <select
              value={subQuestion.type}
              onChange={(e) => {
                const newType = e.target.value;
                let updates = { type: newType };
                
                // Reset type-specific config
                if (newType === 'mcq' || newType === 'multiple-choice') {
                  updates.options = [
                    { id: '1', text: 'Option 1', isCorrect: false },
                    { id: '2', text: 'Option 2', isCorrect: false }
                  ];
                  delete updates.correctAnswer;
                  delete updates.correctAnswers;
                } else if (newType === 'true-false') {
                  updates.correctAnswer = true;
                  delete updates.options;
                  delete updates.correctAnswers;
                } else if (newType === 'short-answer') {
                  updates.correctAnswers = [''];
                  updates.caseSensitive = false;
                  updates.maxLength = 200;
                  delete updates.options;
                  delete updates.correctAnswer;
                }
                
                updateSubQuestion(subQuestion.id, updates);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
            
            <button
              onClick={() => deleteSubQuestion(subQuestion.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <input
            type="text"
            value={subQuestion.question}
            onChange={(e) => updateSubQuestion(subQuestion.id, { question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Question about the passage"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm">
            <span className="text-gray-700 mr-2">Points:</span>
            <input
              type="number"
              min="1"
              value={subQuestion.points || 1}
              onChange={(e) => updateSubQuestion(subQuestion.id, { points: parseInt(e.target.value) || 1 })}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Type-specific editors */}
        {(subQuestion.type === 'mcq' || subQuestion.type === 'multiple-choice') && (
          <div className="space-y-2">
            <h6 className="text-sm font-medium text-gray-700">Answer Options:</h6>
            {subQuestion.options?.map((option, optIndex) => (
              <div key={option.id} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`subq-${subQuestion.id}`}
                  checked={option.isCorrect}
                  onChange={() => {
                    const newOptions = subQuestion.options.map(opt => ({
                      ...opt,
                      isCorrect: opt.id === option.id
                    }));
                    updateSubQuestion(subQuestion.id, { options: newOptions });
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(subQuestion.id, option.id, { text: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${optIndex + 1}`}
                />
                <button
                  onClick={() => deleteOption(subQuestion.id, option.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                  disabled={subQuestion.options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addOption(subQuestion.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Option
            </button>
          </div>
        )}

        {subQuestion.type === 'true-false' && (
          <div className="space-y-2">
            <h6 className="text-sm font-medium text-gray-700">Correct Answer:</h6>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${subQuestion.id}`}
                  checked={subQuestion.correctAnswer === true}
                  onChange={() => updateSubQuestion(subQuestion.id, { correctAnswer: true })}
                  className="text-blue-600 focus:ring-blue-500 mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${subQuestion.id}`}
                  checked={subQuestion.correctAnswer === false}
                  onChange={() => updateSubQuestion(subQuestion.id, { correctAnswer: false })}
                  className="text-blue-600 focus:ring-blue-500 mr-2"
                />
                False
              </label>
            </div>
          </div>
        )}

        {subQuestion.type === 'short-answer' && (
          <div className="space-y-3">
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-2">Acceptable Answers (one per line):</h6>
              <textarea
                value={subQuestion.correctAnswers?.join('\n') || ''}
                onChange={(e) => {
                  const answers = e.target.value.split('\n').filter(a => a.trim());
                  updateSubQuestion(subQuestion.id, { correctAnswers: answers });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Sample answer 1&#10;Sample answer 2&#10;Alternative answer"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={subQuestion.caseSensitive || false}
                  onChange={(e) => updateSubQuestion(subQuestion.id, { caseSensitive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Case sensitive
              </label>
              <label className="flex items-center text-sm">
                <span className="text-gray-700 mr-2">Max length:</span>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={subQuestion.maxLength || 200}
                  onChange={(e) => updateSubQuestion(subQuestion.id, { maxLength: parseInt(e.target.value) || 200 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reading Passage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reading Passage
        </label>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="8"
          placeholder="Enter the reading passage that students will read before answering the questions..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Students will read this passage before answering the questions below.
        </p>
      </div>

      {/* Sub Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Questions about the passage</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => addSubQuestion('mcq')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {subQuestions.map((subQuestion, index) => renderSubQuestionEditor(subQuestion, index))}
          
          {subQuestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No questions added yet.</p>
              <button
                onClick={() => addSubQuestion('mcq')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {passage && subQuestions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
          <ComprehensionQuestionPreview 
            passage={passage}
            subQuestions={subQuestions}
            disabled={true}
          />
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Comprehension Questions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep the passage between 200-500 words for optimal readability</li>
          <li>• Create 3-7 questions that test different comprehension levels</li>
          <li>• Mix question types (multiple choice, true/false, short answer)</li>
          <li>• Ensure questions can only be answered by reading the passage</li>
          <li>• Set appropriate point values based on question difficulty</li>
        </ul>
      </div>
    </div>
  );
};

// Component for form preview and public forms - reading interface
export const ComprehensionQuestionPreview = ({ passage, subQuestions, onResponseChange, responses, disabled = false }) => {
  const [expandedPassage, setExpandedPassage] = useState(true);

  const handleSubQuestionResponse = (subQuestionId, value) => {
    if (!disabled && onResponseChange) {
      onResponseChange(subQuestionId, value);
    }
  };

  const renderSubQuestion = (subQuestion, index) => {
    const responseKey = subQuestion.id;
    const currentResponse = responses?.[responseKey];

    return (
      <div key={subQuestion.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h5 className="font-medium text-gray-900">
            {index + 1}. {subQuestion.question}
          </h5>
          {subQuestion.points && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {subQuestion.points} pt{subQuestion.points !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Render based on sub-question type */}
        {(subQuestion.type === 'mcq' || subQuestion.type === 'multiple-choice') && (
          <div className="space-y-2">
            {subQuestion.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`subq-${subQuestion.id}`}
                  value={option.id}
                  checked={currentResponse === option.id}
                  onChange={(e) => handleSubQuestionResponse(subQuestion.id, e.target.value)}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {subQuestion.type === 'true-false' && (
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`subq-${subQuestion.id}`}
                value="true"
                checked={currentResponse === 'true'}
                onChange={(e) => handleSubQuestionResponse(subQuestion.id, e.target.value)}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`subq-${subQuestion.id}`}
                value="false"
                checked={currentResponse === 'false'}
                onChange={(e) => handleSubQuestionResponse(subQuestion.id, e.target.value)}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        )}

        {subQuestion.type === 'short-answer' && (
          <div>
            <textarea
              value={currentResponse || ''}
              onChange={(e) => handleSubQuestionResponse(subQuestion.id, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              rows="3"
              maxLength={subQuestion.maxLength || 200}
              placeholder={disabled ? "Short answer response..." : "Type your answer here..."}
            />
            {subQuestion.maxLength && (
              <p className="text-xs text-gray-500 mt-1">
                {(currentResponse || '').length}/{subQuestion.maxLength} characters
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reading Passage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Reading Passage</h4>
          <button
            onClick={() => setExpandedPassage(!expandedPassage)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            {expandedPassage ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand
              </>
            )}
          </button>
        </div>
        
        {expandedPassage && (
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {passage}
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
        {subQuestions?.map((subQuestion, index) => renderSubQuestion(subQuestion, index))}
      </div>
    </div>
  );
};

export default ComprehensionQuestionPreview;
