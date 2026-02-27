// Utility function to get authentication token
export const getAuthToken = () => {
  // Try new unified token first
  let token = localStorage.getItem('token');
  
  // Fallback to old token names for backward compatibility
  if (!token) {
    token = localStorage.getItem('studentToken') || localStorage.getItem('instructorToken');
  }
  
  return token;
};

// Utility function to get user data
export const getUserData = () => {
  let userData = localStorage.getItem('userData');
  
  if (!userData) {
    userData = localStorage.getItem('studentData') || localStorage.getItem('instructorData');
  }
  
  return userData ? JSON.parse(userData) : null;
};

// Utility function to get user role
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};
