const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios');
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

app.use(
  session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use('/', express.static('public'));

// set the view engine to ejs
app.set('view engine', 'ejs');
const emailSupport = 'support@gli-ithelps.freshdesk.co';
app.post('/action', async (req, res) => {
  const { fullname, email, department, phone, category, description } =
    req.body;

  const options = {
    method: 'POST',
    url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com',
    },
    data: JSON.stringify({
      personalizations: [
        { to: [{ email: emailSupport }], subject: `แจ้งปัญหา ${category}` },
      ],
      from: { email },
      content: [
        {
          type: 'text/plain',
          value: `
          คุณ${fullname} จากแผนก${department} ต้องการแจ้งปัญหาเรื่อง ${category} มีรายละเอียดดังนี้ ${description} เมื่อได้รับการแก้ไขโทรติดต่อกลับผ่าน ${phone}`,
        },
      ],
    }),
  };

  let isOk = false;
  try {
    const response = await axios.request(options);
    console.log(response.data);
    isOk = true;
  } catch (error) {
    console.log(error.message);
  }
  req.flash('message', isOk ? 'ok' : 'failed');
  res.redirect('/');
});

app.get('/', (req, res) => {
  // console.log(req.flash('message'));
  res.render('pages/index', { payload: req.flash('message') });
});

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log('Server listening on PORT', PORT);
});
