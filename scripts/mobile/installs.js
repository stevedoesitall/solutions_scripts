const https = require('https');

const req = https.request({
    url: 'https://api.carnivalmobile.com/v6/stats/total_installs',
    method: 'GET',
    headers: {
      Authorization: 'ApiKey myUser: ',
      Accept: 'application/json'
    }, function (error, response, body) {
      if (error) throw error;
      console.log(response);
    }
  });

req.on('error', (e) => {
  console.error(e);
});
req.end();