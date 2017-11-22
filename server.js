'use strict';
const request = require('request');
const chalk = require('chalk'); // for coloring
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'Railway Info'
});
// const railway = require('./railway');
const PORT = process.env.PORT || 3000;

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
// server.use((res,req,next) => f.verifySignature(req,res,next)); // server.use()  function is used to mount a middleware for  all incoming requests.This includes get request as well.Thats why we have included a check in the verifySignature function code to check whather it is a post request or not 
// Tokens
// const config = require('./config');

// FBeamer
// const FBeamer = require('./fbeamer');
// const f = new FBeamer(config.FB);

// Your Bot here

// Register the webhooks
// server.get('/', (req, res, next) => {
// 	f.registerHook(req, res);
// 	return next();
// });

const getPnrNumber = (pnrNumber) => {
    console.log("Inside get PNR Number function",pnrNumber);
    // let qs = {
    //     api_key:TMDB,
    //     query:pnrNumber
    // }

    return new Promise((resolve,reject) => {
        request({
            // "http://api.railwayapi.com/v2/pnr-status/pnr/1234567890/apikey/myapikey/"
           uri:'http://api.railwayapi.com/v2/pnr-status/pnr/' + pnrNumber + '/apikey/ljdfb2a97a'
        },(error,response,body) => {
            if(!error && response.statusCode === 200){
                let data = JSON.parse(body);
                resolve(data);
            } else{
                reject(error);
            }
        });
    });

}

const getRailwayInfo = (userQueryObj) => {
    // console.log("Inside get railway Info",userQueryObj);    
    console.log("Inside get railway Info");
    let countryCode = userQueryObj.countrycode;
    let userPhone = userQueryObj.phone;
    let time = userQueryObj.time;
    let mediaType = userQueryObj.mediaType;
    let conversation = userQueryObj.conversation;
    let agentNumber = userQueryObj.agentnumber;
    let mediaUrl = userQueryObj.mediaurl;
    // console.log('userPhoneNumber',userPhone);
    let userMessage = userQueryObj.message;
    console.log(userMessage);
    var userMessagArray = userMessage.split(" ");
    console.log(userMessagArray);
    let pnrNumber = userMessagArray[1];

    return new Promise(async function(resolve,reject){
        try{
            if(pnrNumber.length === 10){
     // ToDO task  => clean the pnr number  
                
                let data = await getPnrNumber(pnrNumber); 
                console.log("PNR INFORMATION",data);
                console.log(data.response_code);
                if(data.response_code === 200){
                    let train_name = data.train_name;
                    let train_num = data.train_num;
                    let from_station = data.from_station.code;
                    let to_station = data.to_station.code; 
                    let on = data.doj;
                    let journey_class = data.journey_class.code;
                    // let current_status = data.passengers[0].current_status;
                    // let booking_status = data.passengers[0].booking_status;
                    let chart_status = data.chart_prepared;
                    let message = '';
                   
                    if(chart_status === false){
                     message = `Train Name: ${train_name} (${train_num}) from ${from_station} to ${to_station} on ${on}.
Your Chart is not prepared `;
                    
                    } else {
                     message = `Train Name: ${train_name} (${train_num}) From ${from_station} To ${to_station} on ${on}.
Your Chart is prepared `;
                    
                    }
                    let passengersArray = data.passengers;
                    for(let i=0;i<passengersArray.length;i++){
                        let current_status = data.passengers[i].current_status;
                        let booking_status = data.passengers[i].booking_status;
                        let count = i+1;
                        message = `${message}
Current Status: ${current_status} 
Booking Status: ${booking_status}`;
                        // message  = message + "Current Status: "+ current_status + "Booking Status: " + booking_status;
                    }
                    console.log("final message",message);
                    

                resolve(message);
                
                } else{
                    resolve("could not fetch information from the databases");
                }
            }
        }catch(error){
            reject(error);
        }
            
    });


             


   
    
    
   
}

// Receive all incoming messages
server.post('/', (req, res, next) => {
    console.log("server post function called");
    // console.log("Request Object",req);
    console.log("Important information",req.body);

    getRailwayInfo(req.body)
        .then(response => {
                console.log("final final response",response);
                // console.log(chalk.blue('Hello world!'));
                let obj = {"messageResponse":response};
                res.send(200,obj);
        })
        .catch(error => {
            console.log(error);
        }) 
//    console.log("final final response",response);
//    res.send(response);
	// f.incoming(req, res, msg => {
		// Process messages
		// const {
		// 	message,
		// 	sender
		// } = msg;
		// if(message.text && message.nlp.entities) {
		// 	console.log("nlp Data",message.nlp.entities);
		// 	railway(message.nlp.entities)
		// 		.then(response =>{
		// 			f.txt(sender,response.txt);
		// 			console.log(response);
		// 		})
		// 		.catch(error => {
		// 			console.log(error);
		// 		}) 
		// 	// If a text message is received
		// 	// f.txt(sender,`You just said ${message.text}`);
		// }
	// });
	// return next();
});

// Subscribe
// f.subscribe();

server.listen(PORT, () => console.log(`RailwayInfo running on port ${PORT}`));
