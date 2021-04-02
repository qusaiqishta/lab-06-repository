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
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;



// Database Connection Setup
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});



//routes
app.get('/location', handleLocationrequest);
app.get('/weather', handleWeatherrequest);
app.get('/parks',handleParkRequest)
app.use('*', notFoundHandler);
app.get('/add',LocationDatabase);
app.get('/country',selectcountries);
app.get('/movies', handleMoviesRequest);
app.get('/yelp',handleYelpRequest);


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
    

    res.json(newLocation);
    errorMsg(res,newLocation);

    
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

  function handleMoviesRequest(request,response){
    const city=request.query.search_query;
    const url=`https://api.themoviedb.org/3/movie/550?api_key=${MOVIE_API_KEY}&city=${city}`
    let movies=[];
    superagent.get(url).then(resData=>{
      movies=resData.body.data.map((value,index)=>{
        let newMovie=new Movies(value);
        return newMovie;
      })
    }).catch(()=>{
      response.status(500).send('something went wrong');
    })
  }

  function handleYelpRequest(request,response){
    const page=request.query.search_query;
    const startPage=(page-1);
    const url='https://api.yelp.com/v3/businesses/search';
    const queryParams = {
      latitude: request.query.latitude,
      longitude: request.query.longitude,
      offset:startPage,
      limit: 20 
     };
     let yelp=[];
     superagent.get(url).set(YELP_API_KEY).query(queryParams).then(resData=>{
       yelp=resData.body.data.map((value,index)=>{
         let newYelp=new Yelp(value);
         return newYelp;
       })
     }).catch(()=>{
       response.status(500).send('something went wrong')
     })

  }





function Location(city, data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
    this.search_query = city;

}


function handleWeatherrequest(req,res){
    const weatherSource=require('./data/weather.json');
    const weatherArray=[];
    weatherSource.data.forEach(weatherSource => {
        let description=weatherSource.weather.description;
        let datetime=weatherSource.datetime;
        weatherArray.push(new Weather(description,datetime));
        
    });
    res.json(weatherArray);
    errorMsg(res,weatherArray);
   

function Weather(weatherDescription, expectedDate) {
    this.weatherDescription = weatherDescription;


}
function Parks(data){
    this.name=data.name;
    this.fee=data.fees||'0.00';
    this.description=data.description;
    this.url=data.url;
    this.address=data.addresses;

}

function Movies(data){
  this.title=data.title;
  this.overview=data.overview;
  this.average_votes=data.average_votes;
  this.total_votes=data.total_votes;
  this.image_url=data.image_url;
  this.popularity=data.popularity;
  this.released_on=data.released_on;

}


function Weather(description,datetime){
    this.forecast = description;
    this.dateTime = datetime;
    

function Yelp(data){
  this.name=data.name;
  this.image_url=data.image_url;
  this.price=data.price;
  this.rating=data.rating;
  this.url=data.url;

}

function LocationDatabase(request,response){
    const{ formatted_query,latitude,longitude,search_query}=request.query;
    let sqlQuery= 'INSERT INTO location VALUES ($1,$2,$3,$4) ';
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