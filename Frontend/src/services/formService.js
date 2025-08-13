import api from './api';

export const formService = {
  // Get all forms for the authenticated user
  getForms: async (params = {}) => {
    const response = await api.get('/forms', { params });
    return response.data;
  },

  // Get a specific form
  getForm: async (id) => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  // Create a new form
  createForm: async (formData) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  // Update an existing form
  updateForm: async (id, formData) => {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  },

  // Delete a form
  deleteForm: async (id) => {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },

  // Publish/unpublish a form
  togglePublish: async (id, isPublished) => {
    const response = await api.post(`/forms/${id}/publish`, { isPublished });
    return response.data;
  },

  // Duplicate a form
  duplicateForm: async (id) => {
    const response = await api.post(`/forms/${id}/duplicate`);
    return response.data;
  },

  // Get form responses
  getFormResponses: async (formId, params = {}) => {
    const response = await api.get(`/forms/${formId}/responses`, { params });
    return response.data;
  },

  // Get public form (for form filling)
  getPublicForm: async (id) => {
    try {
      const response = await api.get(`/public/forms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public form:', error);
      // Return a structured error response instead of throwing
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || 'Failed to load form'
        }
      };
    }
  },

  // Submit form response
  submitResponse: async (responseData) => {
    const response = await api.post('/responses', responseData);
    return response.data;
  },

  // Get single response
  getResponse: async (id) => {
    const response = await api.get(`/responses/${id}`);
    return response.data;
  }
};