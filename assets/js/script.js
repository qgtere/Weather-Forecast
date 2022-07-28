var APIKey = "de886011f3a8e864238cae6de4c81ac1";
var arrForecast = [];
var arrTemp = [];

var formEl = document.querySelector("#cityForm");
var cityEl = document.querySelector("#cityName");
var weatherTodayEl = document.querySelector("#weatherToday");
var h5DaysEl = document.querySelector("#h5Days");
var divCardsEl = document.querySelector("#divCards");
var divHistoryEl = document.querySelector("#divHistory");
var diverrorMsgEl = document.querySelector("#errorMsg");
var pErrorTextEl = document.querySelector("#errorText");

//adds elements into the html
function addElement(element, content, attr, attrValue, father) {
    var newEle = document.createElement(element);
    if (content !== "") {
        newEle.textContent = content;
    }    
    if (attr !== "") {
        newEle.setAttribute(attr, attrValue);        
    }
    father.appendChild(newEle);

};

/*delete html elements, receives the father element*/
function clearElements(element) {
    if (element.childNodes.length > 0) {         
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
};

//displays the cities in the history
function showHistory() {
    clearElements(divHistoryEl);
    for (i = 0; i < arrForecast.length; i++) {
        addElement("div", arrForecast[i].city, "class", "btn btn-secondary col-12 mb-3", divHistoryEl);    
    }
};

//displays forecast for the next 5 days
function display5daysForecast(idx) {
    clearElements(divCardsEl);
    h5DaysEl.textContent = "5-Days Forecast: ";

    for (i = 0; i < arrForecast[idx].forecast.length; i++) {
        var divEl = document.createElement("div");
        divEl.setAttribute("class", "card-body custom-card m-4");
    
        addElement("p", arrForecast[idx].forecast[i].date, "class", "card-title h5", divEl);
        addElement("img", "", "src", arrForecast[idx].forecast[i].icon, divEl);
        addElement("p", arrForecast[idx].forecast[i].temp, "class", "card-text", divEl);
        addElement("p", arrForecast[idx].forecast[i].wind, "class", "card-text", divEl);
        addElement("p", arrForecast[idx].forecast[i].wind, "class", "card-text", divEl);
        addElement("p", arrForecast[idx].forecast[i].humidity, "class", "card-text", divEl);
    
        divCardsEl.appendChild(divEl);
    }  

};

//displays the forecast for today
function displayForecast(idx) {   
    clearElements(weatherTodayEl);
    weatherTodayEl.setAttribute("style", "visibility: visible");

    arrForecast = JSON.parse(localStorage.getItem("forecast"));

    var cityDate = arrForecast[idx].city + " " + arrForecast[idx].currDate;
    addElement("h2", cityDate, "", "", weatherTodayEl);
    addElement("img", "", "src", arrForecast[idx].currIcon, weatherTodayEl);
    addElement("p", arrForecast[idx].currTemp, "", "", weatherTodayEl);
    addElement("p", arrForecast[idx].currWind, "", "", weatherTodayEl);
    addElement("p", arrForecast[idx].currHumidity, "", "", weatherTodayEl);
    var pUVidx = document.createElement("p");
    pUVidx.textContent = "UV Index: ";
    addElement("span", arrForecast[idx].currUVIndex, "class", "px-2 " + arrForecast[idx].currColorUVIndex , pUVidx);
    weatherTodayEl.appendChild(pUVidx);

    display5daysForecast(idx);    
    
};

//displays the error msg
function displayError(error) {
    diverrorMsgEl.setAttribute("style", "visibility: visible");
    diverrorMsgEl.textContent = error;

};

//gives the scale color to the UVIndex
function colorUV(uvIndex) {
    switch(uvIndex) {
        case 0:
        case 1:
        case 2:
          arrForecast[0].currColorUVIndex = "UVgreen";
          break;
        case 3:
        case 4:
        case 5:
          arrForecast[0].currColorUVIndex = "UVyellow";
          break;
        case 6:
        case 7:
            arrForecast[0].currColorUVIndex = "UVorange";
            break;
        case 8:
        case 9:
        case 10:
            arrForecast[0].currColorUVIndex = "UVred";
            break;
        default:
            arrForecast[0].currColorUVIndex = "UVpurple";
            break;
      }
};

//saves the 5 days forecast in the array
function add5daystoArray(data) {
    var j = 0;
    arrForecast[0].currUVIndex = data.daily[0].uvi;
    colorUV(parseInt(data.daily[0].uvi));
    for (i = 1; i < data.daily.length - 2; i++) {        
        var dt = (new Date(data.daily[i].dt * 1000));
        arrForecast[0].forecast[j] = {            
            date: "(" + (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() + ")",
            icon: "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png",
            temp: "Temp: " + data.daily[i].temp.day + " F",
            wind: "Wind: " + data.daily[i].wind_speed + " MPH",
            humidity: "Humidity: " + data.daily[i].humidity + " %"
        }
        j++;
    }
    localStorage.setItem("forecast", JSON.stringify(arrForecast));

};

//calls the API to get the 5 days forecast
function get5daysForecast(lat, lon){
    var APIurl = "https://api.openweathermap.org/data/3.0/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&units=imperial&appid=" + APIKey;
    fetch(APIurl)
    .then(function(response){
        if (response.ok){
            response.json()
            .then(function(data){  
                add5daystoArray(data);
                displayForecast(0);
                showHistory();  
                
            });
        } else {
            displayError("An error has occurred: " + response.status + ", " + response.statusText);
        }
    })
    .catch(function(error){
        displayError("An error has occurred, " + error);
    })

};

//gets today weather and save it in an array
function addtoArr(data) {

    if (arrForecast.length > 6) {
        arrForecast.pop();
    }
    var dt = (new Date(data.dt * 1000)); 
    var strDate = "(" + (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() + ")";       
    var cityData = {
        city: data.name + ", " + data.sys.country,
        currDate: strDate,
        currIcon: "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png",
        currTemp: "Temp: " + data.main.temp + " F",
        currWind: "Wind: " + data.wind.speed + " MPH",
        currHumidity: "Humidity: " + data.main.humidity + " %",
        currUVIndex: "",
        currColorUVIndex: "",
        forecast: []
    }
    arrForecast.unshift(cityData);
    
};

//calls to the API to get today weather. Validates if is a city you already have in the history
function getTodayWeather(city){
    var APIurl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + APIKey;
    
    fetch(APIurl)
    .then(function(response){
        if (response.ok){ 
            response.json()
            .then(function(data){
                for (i = 0; i < arrForecast.length; i++){
                    if (arrForecast[i].city === data.name + ", " + data.sys.country){
                        arrTemp = arrForecast.slice(i, i + 1);
                        arrForecast.splice(i, 1);
                        arrForecast.unshift(arrTemp[0]);
                        localStorage.setItem("forecast", JSON.stringify(arrForecast));
                        displayForecast(0);
                        showHistory();
                        return;
                    }
                }              
                addtoArr(data);
                get5daysForecast(data.coord.lat, data.coord.lon);
                
            });
        } else {
            displayError("An error has ocurred: " + response.status + ", " + response.statusText);
        }
    })
    .catch(function(error){
        displayError("An error has occurred, " + error);
    })
       
};

//tooks user input
var CityFormSubmit = function(event){
    event.preventDefault();
    
    var cityName = cityEl.value.trim();
    if (cityName != "") {
        getTodayWeather(cityName);
        cityEl.value = '';
        cityEl.focus();
        
    } else {
        cityEl.value = '';
        alert("You must enter a City Name");
    }

};

//when click on a history's city
divHistoryEl.addEventListener("click", function(event){
    for (i = 0; i < arrForecast.length; i++) {
        if(event.target.textContent === arrForecast[i].city) {
            displayForecast(i);
            return;            
        }
    }

});

//checks for local storage. If already exists display it
function getStorage() {
    if (localStorage.forecast) {
        arrForecast = JSON.parse(localStorage.getItem("forecast"));
        if (arrForecast !== null) {
            displayForecast(0);
            showHistory();
        }

    } 
};

//when the doc is ready, gets the storage
document.addEventListener("DOMContentLoaded", function(event) { 
    getStorage();
});

formEl.addEventListener("submit", CityFormSubmit);

