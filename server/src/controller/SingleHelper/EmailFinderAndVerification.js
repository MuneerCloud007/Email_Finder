import axios from 'axios';

const Million_verifier_API_KEY = "I1bhNtONTtv9oVPizmDpvoYTe"

const apiKey=Million_verifier_API_KEY;
// Define the function
async function fetchEmailVerification( email, timeout=20) {
    try {
      // Make the GET request
      const response = await axios.get('https://api.millionverifier.com/api/v3/', {
        params: {
          api: apiKey,
          email: email,
          timeout: timeout
        }
      });
      // Return the response data
      return response.data;
    } catch (error) {
      // Handle errors
      console.error('Error fetching email verification:', error);
      throw error; // Rethrow error to be handled by caller
    }
  }
  

  export {fetchEmailVerification}