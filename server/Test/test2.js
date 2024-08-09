import axios from 'axios';

const apiKey = 'cpgqIg2532EmklNRIM3D5e5z7puKIj'; // Replace with your actual API key
const requestId = 'vmgrbfsvwfqisel'; // Replace with your actual request ID

axios.get(`https://api.dropcontact.io/batch/${requestId}`, {
  headers: {
    'X-Access-Token': apiKey
  }
})
.then(response => {
  console.log(response.data);
  if(response.data["data"]) {
  console.log( response.data["data"][2]["email"]);
  }
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});
