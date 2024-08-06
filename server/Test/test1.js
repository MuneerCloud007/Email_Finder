import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const form = new FormData();
form.append('file_contents', fs.createReadStream('./Excel_Data.xlsx'), 'Excel_Data.xlsx');


const options = {
  method: 'POST',
  url: 'https://bulkapi.millionverifier.com/bulkapi/v2/upload?key=I1bhNtONTtv9oVPizmDpvoYTe',
  headers: {
    ...form.getHeaders(),
  },
  data: form,
};

axios(options)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
