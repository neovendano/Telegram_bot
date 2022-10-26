const TelegramBot = require ('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.botToken;
const bot = new TelegramBot(token, {polling: true});
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome", {
        "reply_markup": {
            "keyboard": [["Weather in Kyiv"]]
        }
    });

});

bot.on('message', async (msg) =>{
    if(msg.text === 'Weather in Kyiv'){
        await bot.sendMessage(msg.chat.id, "Kyiv... ", {
            "reply_markup": {
                "keyboard": [["Per 3 hours"], ["Per 6 hours"]]
            }
        });
    }

    else if(msg.text === 'Per 3 hours'){
        await bot.sendMessage(msg.chat.id, "... per 3 hours",{
            "reply_markup": {
                "keyboard": [["Weather in Kyiv"]]
            }
        });
        await weatherReport(3, msg);
    }

    else if(msg.text === 'Per 6 hours'){
        await bot.sendMessage(msg.chat.id, "... per 6 hours",{
            "reply_markup": {
                "keyboard": [["Weather in Kyiv"]]
            }
        });
        await weatherReport(6, msg);
    }
})

async function weatherReport(timeDelay, msg){
    let weatherMessage = '';
    let lat = '50.27';
    let lon = '30.31';
    let appid = 'f667b0118db2be6be435c0b25c3706dd';
    let lang = 'ru'
    const weatherData = await axios
        .get(`https://api.openweathermap.org/data/2.5/forecast?appid=${appid}&lat=${lat}&lon=${lon}&lang=${lang}`);

    let curDate = 0;
    for (let el in weatherData.data.list){
        const weatherDate = new Date(weatherData.data.list[el].dt_txt);
        if (curDate !== weatherDate.getDate()){
            weatherMessage += '\n' + await getDateString(weatherDate) + '\n';
            curDate = weatherDate.getDate();
        }

        if (weatherDate.getHours()%timeDelay === 0) {
            weatherMessage += await getTimeString(weatherDate) +', ';

            let temperature = weatherData.data.list[el].main.temp - 273;
            let feelTemperature =  weatherData.data.list[el].main.feels_like - 273;
            weatherMessage += '+' + temperature.toFixed(0 ) + '°C, ';
            weatherMessage += 'ощущается как +' + feelTemperature.toFixed(0 ) + '°C, '
                + weatherData.data.list[el].weather[0].description + '\n';
        }

    }
    await bot.sendMessage(msg.chat.id, weatherMessage)
}

async function getDateString(date){
    const months =
        ["января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const days =
        ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница",
            "Суббота"];
    let dateString = '';

    dateString += days[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] +":";
    return dateString;
}

async function getTimeString(date){
    let timeString = ' ';
    timeString += date.getHours().toString().padStart(2, "0") + ":00";
    return timeString;
}