import request from 'request';

const options = {
  method: 'POST',
  url: 'https://api.leadmagic.io/email-finder',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'X-API-Key': '446d70f0649f9367661c648a3df6de6e' // Replace with your actual API key
  },
  body: {
    first_name: 'muneer', // Replace with the first name you want to search for
    last_name: 'ahamed', // Replace with the last name you want to search for
    domain: 'cloudvandana.com', // Replace with the domain you want to search within
  },
  json: true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
