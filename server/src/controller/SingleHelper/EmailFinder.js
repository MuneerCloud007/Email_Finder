import axios from 'axios';


const Icypeas_API_KEY= "4e7771166d374ba090178bc44afa866ccca4e2321a5d46b287ab798393103e04"
const Icypeas_User_Id="HDfZMJEBaqmq-y7YoiK_"
const apiKey =Icypeas_API_KEY; // Replace with your actual API key
const userId = Icypeas_User_Id; // Replace with your actual User ID


const findEmail = async (firstName, lastName, domainOrCompany) => {
  const apiUrl = 'https://app.icypeas.com/api/email-search';

  console.log("PLS CHECK API KET = "+apiKey);
  console.log("PLS CHECK THE USERID = "+userId);
  
  const postData = {
    firstname: firstName,
    lastname: lastName,
    domainOrCompany: domainOrCompany
  };

  try {
    const response = await axios.post(apiUrl, postData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${apiKey}`
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response code: ${response.status}`);
    }
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};


const getSearchResult = async (searchId, mode = 'single') => {
  const apiUrl = 'https://app.icypeas.com/api/bulk-single-searchs/read';
  
  const postData = {
    user: userId,
    mode: mode,
    id: searchId
  };

  try {
    const response = await axios.post(apiUrl, postData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${apiKey}`
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected response code: ${response.status}`);
    }
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

const checkSearchProgress = async (searchId, type='email-search') => {
    const apiUrl = 'https://app.icypeas.com/api/bulk-single-searchs/read';
    
    const postData = {
      user: userId,
      limit: 1,
      mode: 'single',
      type: type // e.g., 'email-search'
    };
  
    try {
      const response = await axios.post(apiUrl, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${apiKey}`
        }
      });
  
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected response code: ${response.status}`);
      }
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  };
  
export {findEmail,getSearchResult,checkSearchProgress};
