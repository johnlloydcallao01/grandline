// PayloadCMS API Service with API Key Authentication
// Based on payload-cms-api.md documentation

const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY;
const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL;

if (!PAYLOAD_API_KEY) {
  throw new Error('PAYLOAD_API_KEY environment variable is required');
}

if (!PAYLOAD_API_URL) {
  throw new Error('PAYLOAD_API_URL environment variable is required');
}

/**
 * Fetch data from PayloadCMS with API key authentication
 * @param {string} endpoint - The API endpoint (e.g., 'courses', 'categories')
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} - The API response data
 */
export async function fetchFromPayload(endpoint, options = {}) {
  const url = `${PAYLOAD_API_URL}/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `users API-Key ${PAYLOAD_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayloadCMS API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Convenience functions for common operations
export const getCourses = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `courses?${queryString}` : 'courses';
  return fetchFromPayload(endpoint);
};

export const getCourse = (id) => fetchFromPayload(`courses/${id}`);

export const getCategories = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `categories?${queryString}` : 'categories';
  return fetchFromPayload(endpoint);
};

export const getCategory = (id) => fetchFromPayload(`categories/${id}`);

export const getUsers = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `users?${queryString}` : 'users';
  return fetchFromPayload(endpoint);
};

export const getUser = (id) => fetchFromPayload(`users/${id}`);

// Create operations (if your API key has create permissions)
export const createCourse = (data) => fetchFromPayload('courses', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const createUser = (data) => fetchFromPayload('users', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Update operations (if your API key has update permissions)
export const updateCourse = (id, data) => fetchFromPayload(`courses/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});

export const updateUser = (id, data) => fetchFromPayload(`users/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
});

// Delete operations (if your API key has delete permissions)
export const deleteCourse = (id) => fetchFromPayload(`courses/${id}`, {
  method: 'DELETE',
});

export const deleteUser = (id) => fetchFromPayload(`users/${id}`, {
  method: 'DELETE',
});

// Health check function
export const checkApiHealth = async () => {
  try {
    // Try to fetch a simple endpoint to verify API key works
    await fetchFromPayload('courses?limit=1');
    return { status: 'healthy', message: 'API key authentication successful' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};