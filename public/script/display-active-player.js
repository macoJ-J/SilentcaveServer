function displayActivePlayer()
{
    const activeuserjson = require(__dirname +'/../json/activeplayerdata.json');
    
    console.log(activeuserjson);
    console.log(activeuserjson.length);
    document.getElementById("getData").innerHTML = "現在接続中のプレイヤーは" + activeuserjson.length + "名です。";
}