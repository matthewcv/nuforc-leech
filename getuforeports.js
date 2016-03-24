var webpage = require('webpage');
var page = webpage.create();
var system = require('system');

page.onError=function(msg, trace){
    console.log("page error",msg,trace);
};

page.onConsoleMessage = function(msg, lineNum, sourceId){
    console.log("page console message",msg,lineNum,sourceId);
};

var reportIdx = 1

function getReports(){
    page.open(system.args[reportIdx],function(status){
        try{
            console.log("getting reports for",system.args[reportIdx])

            var links = getTheLinks();
            var idx = 0;
            
            var localGetData = function(){
                getTheData(links[idx],function(data){
                    idx++;
                    
                    console.log("uforeport",JSON.stringify(data))
                    
                    if(idx == links.length){
                    //if(idx == 9){
                        reportIdx++;
                        if(reportIdx == system.args.length){
                            phantom.exit()
                        }else{
                            getReports();
                        }
                    }
                    else{
                        localGetData();
                    }
                })
            }
            
            localGetData();
            
        }catch(e){
            console.log('ERROR', e);
            phantom.exit();
        }
        
    })
}
if(system.args[1] == "single"){
    getTheData(system.args[2], function(data){
        //console.log(JSON.stringify(data))
        console.log("uforeport",JSON.stringify(data))
        phantom.exit()
    })    
}else{
    getReports();
}

function getTheData(link, heresTheData){

    page.open("http://www.nuforc.org/webreports/" + link, function(status){

        var rawFromPage = page.evaluate(function(){
            return {
                description: document.querySelector('body > table > tbody > tr:nth-child(2) > td').innerText,
                fields: document.querySelector('body > table > tbody > tr:nth-child(1) > td').innerText,
            }
        });
        
        var data = {
            id:parseInt( link.split('.')[0].split('/').pop().substr(1))
        }
        
        parseRawFromPageData(rawFromPage,data)
        
        heresTheData(data);
        
    })
    
}

function parseRawFromPageData(rawData, data){
    data.description = rawData.description;
    var fields = rawData.fields.split('\n');
    
    for (var index = 0; index < fields.length; index++) {
        var field = fields[index];
        var i = field.indexOf(":");
        var val = field.substr(i + 1).trim();
        if(val == ''){
            val = null;
        }
        data[field.substr(0,i).toLowerCase().trim()] = val;
    }
    
    if(data.occurred.indexOf('(') > -1)
    {
        data.occurred = data.occurred.substr(0,data.occurred.indexOf('(')-1);
    }
    data.reported = data.reported.substr(0, data.reported.indexOf(' ')) + data.reported.substr(data.reported.lastIndexOf(' '));
    data.city = data.location.substr(0, data.location.lastIndexOf(',')).trim() ;
    data.state = data.location.substr(data.location.lastIndexOf(',') +1).trim() || null;
    delete data.location;
    
    data.occurred =dateFormat2( new Date(data.occurred));
    data.reported =dateFormat2( new Date(data.reported));
    data.posted =dateFormat1( new Date(data.posted));
}

function pad(num){
    if(num < 10){
        return "0" + num;
    }
    return num;
}

function dateFormat1(date){
    if(isNaN( date.getDate())) {
        return null;
    }
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate())
}

function dateFormat2(date){
    if(isNaN( date.getDate())) {
        return null;
    }
    return dateFormat1(date) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes())
}

function getTheLinks(){
        var links = page.evaluate(function(){
            var ret = [];
            var links = document.querySelectorAll('table a');
            for (var index = 0; index < links.length; index++) {
                var element = links[index];
                ret.push(element.attributes['href'].value)
            }
            return ret;
            
        });
        
        return links;
}