'use strict'

require('dotenv').config();


const express = require('express');
const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT;
const app = express();
app.use(cors());
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARK_API_KEY=process.env.PARK_API_KEY;




//routes
app.get('/location', handleLocationrequest);
app.get('/weather', handleWeatherrequest);
app.get('/parks',handleParkRequest)
app.use('*', notFoundHandler);


function handleLocationrequest(request, response) {
    const city = request.query.city;
    console.log('ddddddddddd')
    const url = `https://us1.locationiq.com/v1/search.php?key=${GEO_CODE_API_KEY}&q=${city}&format=json`;

    
    superagent.get(url).then(resData => {
        const location = new Location(city, resData.body[0])
        response.status(200).send(location);
        }).catch((error) => {
            console.log('ERROR', error);
            response.status(500).send('Sorry, something went wrong');
        });
    
    
        if (!city) {
            response.status(404).send('no search query was provided');
        }

    }

function handleWeatherrequest(request, response) {
    const weatherArray = [];
    const city =request.query.city;
    const longitude = request.query.longitude;
    const latitude = request.query.latitude;
    const url=`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;
    superagent.get(url).then(resData => {
        weatherArray = resData.body.data.map((value, index) => {
          return (new Weather(value));
        });
      }).catch(() => {
          response.status(500).send('Something Went Wrong');
        })
  }





function Location(city, data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
    this.search_query = city;

}

function Weather(weatherDescription, expectedDate) {
    this.weatherDescription = weatherDescription;
    this.expectedDate = expectedDate;

}
function Parks(data){
    this.name=data.name;
    this.fee=data.fees||'0.00';
    this.description=data.description;
    this.url=data.url;
    this.address=data.addresses;

}


function handleParkRequest(request,response){
    const parks=[];

    const longitude = request.query.longitude;
    const latitude = request.query.latitude;
const url=`https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=${PARK_API_KEY}`;
superagent.get(url).then(resData => {
    parks = resData.body.data.map((value, index) => {
      return (new Parks(value));
    });
  }).catch(() => {
      response.status(500).send('Something Went Wrong');
    })
}



function errorMsg(response, data) {
    if (response.status == 200) {
        response.status(200).send(data);
    }
    else {
        response.status(500).send('error entering , try again')
    }
}


app.use('*', (req, res) => {
    res.status(404).send('The Route not found');
});
app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));



function notFoundHandler(request, response) {
    response.status(404).send('huh?');
}