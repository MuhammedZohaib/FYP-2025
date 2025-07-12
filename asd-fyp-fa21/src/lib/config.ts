export const getApiBaseUrl = () => {
  // Check if we have an environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback logic based on environment
  if (process.env.NODE_ENV === "production") {
    // You can update this with your production API URL
    return "https://131.163.80.80:8000/api";
  }

  // Default to localhost for development
  return "http://localhost:8000/api";
};

export const API_BASE_URL = getApiBaseUrl();
