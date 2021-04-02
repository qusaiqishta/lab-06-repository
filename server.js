'use strict'

require('dotenv').config();


const express=require('express');
const cors=require('cors');
const { response } = require('express');

const PORT = process.env.PORT;
const app = express();
app.use(cors());




//routes
app.get('/location',handleLocationrequest);
app.get('/weather',handleWeatherrequest);


function handleLocationrequest(req,res){
    const city = req.query.city;
    const locationDataSource=require('./data/location.json');
    let newLocation= new Location(city,locationDataSource[0]);
    
    res.json(newLocation);
    errorMsg(res,newLocation);
   
    

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
   

}


function Location(city,data){
    this.formatted_query=data.display_name;
    this.latitude=data.lat;
    this.longitude=data.lon;
    this.search_query = city;
    
}

function Weather(description,datetime){
    this.forecast = description;
    this.dateTime = datetime;
    
}
function errorMsg(response,data){
    if(response.status==5000){
        response.status(5000).send(data);
    }
    else{
        response.status(500).send('error entering , try again')
    }
}


app.use('*',(req,res)=>{
    res.status(404).send('The Route not found');
  });
app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));

