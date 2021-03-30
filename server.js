'use strict'

require('dotenv').config();


const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');

const PORT = process.env.PORT;
const app = express();
app.use(cors());
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARK_API_KEY=process.env.PARK_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;



// Database Connection Setup
const client = new pg.Client(DATABASE_URL);




//routes
app.get('/location', handleLocationrequest);
app.get('/weather', handleWeatherrequest);
app.get('/parks',handleParkRequest)
app.use('*', notFoundHandler);
app.get('/add',LocationDatabase);
app.get('/country',selectcountries);


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

function LocationDatabase(request,response){
    const{ formatted_query,latitude,longitude,search_query}=request.query;
    let sqlQuery= 'INSERT INTO locations VALUES ($1,$2,$3,$4) ';
    let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];
    client.query(sqlQuery, safeValues).then(result => {

        res.status(200).json(result);
      }).catch(error => {
        console.log(error);
        res.status(500).send('Internal server error');
      });
}
function selectcountries(req, res) {
    const sqlQuery = `SELECT * FROM location`;
  
    client.query(sqlQuery).then(result => {
      res.status(200).json(result.rows);
    }).catch(error => {
      console.log(error);
      res.status(500).send('Internal server error');
    });
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
client.connect().then(() => {
    app.listen(PORT, () => {
      console.log("Connected to database:", client.connectionParameters.database) //show what database we connected to
      console.log('Server up on', PORT);
    });
  })



function notFoundHandler(request, response) {
    response.status(404).send('huh?');
}