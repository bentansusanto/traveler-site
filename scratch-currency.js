const https = require('https');

https.get('https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR,TRY', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Response:");
    console.log(data);
  });
}).on('error', (err) => {
  console.error(err);
});
