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

    const cityQueryParam = {
        key: GEO_CODE_API_KEY,
        city: city,
        format: 'json'
    };

    superagent.get(url).then(resData => {
        let location = new Location(city, resData.body[0])
        response.status(200).send(location);
        }).catch((error) => {
            
            response.status(500).send('Sorry, something went wrong');
        });
    
    
        if (!city) {
            response.status(404).send('no search query was provided');
        }

    }

function handleWeatherrequest(request, response) {
    let weatherArray = [];
    const city =request.query.search_query;
    const longitude = request.query.longitude;
    const latitude = request.query.latitude;
    const url=`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;
    superagent.get(url).then(resData => {
        weatherArray = resData.body.data.map((value, index) => {
          return (new Weather(value));
        });
        response.json(weatherArray);
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

function Weather(value) {
    this.forecast = value.weather.description;
    this.dateTime = value.dateTime;
}
function Parks(data){
    this.name=data.name;
    this.fee=data.fee;
    this.description=data.description;
    this.url=data.url;
    this.address=data.address;

}

function handleParkRequest(request,response){
    let parks=[];

    const city = request.query.search_query;
    const latitude = request.query.latitude;
const url=`https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${PARK_API_KEY}`;
superagent.get(url).then(resData => {
    parks = resData.body.data.map((value, index) => {
      return (new Parks(value));
    });
    response.json(parks);
  }).catch((err) => {
      response.status(500).send(err);
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

