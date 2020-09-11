const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const router = express.Router();
const cors = require('cors')
const sql = require("./models/db.js");
const StringBuilder = require("string-builder");
const app = express();

let port = process.env.PORT || 3000;


let hostdbname  = "b2brk7x1sjzfvskoaj5m.";
let localhostdbname = "todo.";

sql.connect(function(err) {
  if (err) throw err;
  console.log(" Database Connected!");
});


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

var sess; // global session, NOT recommended


// simple route
app.get("/test", (req, res) => {
  sql.query('SELECT * FROM tasks', function (error, results, fields) {
      if (error) throw error;
      res.send(results)
    });
});


// UserRegistration API
app.post("/userregistration",(req,res) =>{
   var params  = req.body;
   console.log(params);
   let userregistrationquery  = "call  "+ hostdbname+"sp_user_registration(?,?,?,?,?,?)";
   sql.query(userregistrationquery, [params.user_login,params.user_password,params.user_first_name,params.user_surname,
    params.user_mobile_number,params.user_email_id], function (error, results, fields)  {
    if (error) {
      if(error.code == 'ER_DUP_ENTRY' || error.errno == 1062)
      {
          return res.send({ error: true, data: results, message: 'User already exist.' });
      }
      else{
         console.log('Other error in the query')
       }
     }else{
       // sendSMS(params.user_mobile_number,"Thanks for register with to-do-list By chethan");
        return res.send({ error: false, message: 'New user has been created successfully.' });
     }
     
  });
});

function sendSMS(user_mobile_number,message){
  // Download the helper library from https://www.twilio.com/docs/node/install
  // Your Account Sid and Auth Token from twilio.com/console
  // DANGER! This is insecure. See http://twil.io/secure
  const accountSid = 'AC53e14c54cccc2353a6eb09e9c07e33a2';
  const authToken = '4d50e23af709ddcd90c5c4b5b154f1a9';
  const client = require('twilio')(accountSid, authToken);

    client.messages
    .create({
      body: message,
      from: '+16782937751',
      to: user_mobile_number
    })
  .then(message => console.log(message.sid));
}

// login API 
app.post("/login",(req,res) => {
  sess = req.session;
  console.log(req.body)
  let loginstoredQuery = "call "+hostdbname+"sp_isLogin(?, ?)";
  console.log(loginstoredQuery) 
  sql.query(loginstoredQuery,[ req.body.user_login, req.body.user_password], function (err, result, fields){
     console.log(result);
     if(!err){
      return  res.send({ err: false, result});
     }else{
      return  res.send({ err: true, result, message :" error" });
     }
   });
});


// Insert the Task by UserId API
app.post('/inserttask',(req,res) => {
  console.log(req.body)
  let sp_insertquery  = "call "+hostdbname+"sp_insertTasksByUserId(?, ?, ?, ?, ?, ?, ?)";
  console.log(sp_insertquery)
  sql.query(sp_insertquery,[req.body.user_id,
    req.body.task_name,req.body.task_priority,
    req.body.task_color,req.body.task_description,
    req.body.task_attendees,req.body.task_date],function(err, result, fields){
    if(!err){
      console.log(result)
      return res.end(JSON.stringify(result)); 
     }else{
      return  res.send({ err: true, fields, message :" error" });
      }
    });
});



// Get Alltasks by UserId API 
app.get('/gettasks/:id',(req,res) => {
  console.log(req.params.id)
  let gettaksbyidquery = "call "+hostdbname+"sp_getTasksByUserId(?)";
  console.log(gettaksbyidquery)
  sql.query(gettaksbyidquery,[req.params.id], function (err, result, fields){
    console.log(result);
    if(!err){
     return  res.send({ err: false, result});
    }else{
     return  res.send({ err: true, result, message :" error" });
    }
  });
});


// Delete the single Task by user id 
app.delete('/deletetask',(req,res) => {
  const  user_id =  req.body.user_id
  const  task_id  = req.body.task_id 
  let deletespquery = "call "+hostdbname+"sp_deleteTaskByuserId(?,?)";
  console.log(deletespquery)
  sql.query(deletespquery,[req.body.user_id,req.body.task_id], function (err, result, fields){
    console.log(result);
    if(!err){
     return  res.send({ err: false, result,message :" Sucessfully Delete the task"});
    }else{
     return  res.send({ err: true, result, message :" error" });
    }
  });
});

// update the single Task by user id 
app.put('/updatetask',(req,res) => {
  console.log(req.body)
  let sp_updatequery  = "call "+hostdbname+"sp_updatetaskbyuserid(?, ?, ?, ?, ?, ?, ?, ?)";
  console.log(sp_updatequery)
  sql.query(sp_updatequery,[user_id,task_id,task_name,task_priority,task_color,task_description,task_attendees,task_date],function(err, result, fields){
    if(!err){
      console.log(result)
      return res.end(JSON.stringify(result)); 
     }else{
      return  res.send({ err: true, fields, message :" error" });
      }
    });
});


app.delete('/deletealltask/:userid',(req,res) => {
  const userid =  req.params.userid
  console.log(userid);
  let deletealltaskbyid_query = "call "+hostdbname+"todo.sp_deletealltaskByuserid(?)";
  sql.query(deletealltaskbyid_query,[req.params.userid],function(err, result, fields){
    if(!err){
      console.log(fields)
      return res.end(JSON.stringify(result)); 
     }else{
      return  res.send({ err: true, fields, message :" error" });
      }
    });
});



app.all('/ping', (req, res) => res.send(new Date()))

// set port, listen for request
app.listen(port, () => {
  console.log('Server is running on port 3000.');
});


