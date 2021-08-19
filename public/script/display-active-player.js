function displayActivePlayer()
{
    const fs = require('fs');

const activeuserjson = require('/json/activeplayerdata.json');
    
    document.getElementById("getData").innerHTML = activeuserjson[Object.keys(activeuserjson).length];
}

window.onload =displayActivePlayer;