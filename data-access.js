var sqlite = require('q-sqlite3');
var filename = "uforeports.sqlite";
var createTable = `create table uforeports(
    id TEXT PRIMARY KEY,
    description TEXT,
    occurred TEXT,
    reported TEXT,
    posted TEXT,
    shape TEXT,
    duration TEXT,
    city TEXT,
    state TEXT
)`;

var insertUfoReport = `insert into uforeports(id,description,occurred,reported,posted,shape,duration,city,state) 
values ($id,$description,$occurred,$reported,$posted,$shape,$duration,$city,$state)`;

var findTable = `SELECT * FROM sqlite_master WHERE type='table' AND name='uforeports';`;

var countreports = `select count(*) 'count' from uforeports`

module.exports.insertUfoReport = function(report){
    var param = {}
    for(var k in report){
        param["$" + k] = report[k]
    }
    return getDatabase().then(db => {
        return db.run(insertUfoReport,param)
    })
}

module.exports.ufoReportCount = function(){
    return getDatabase().then(db =>{
        return db.get(countreports);
    })
}


function getDatabase(){
    
    return new Promise((resolve,reject)=>{
        sqlite.createDatabase(filename).then(db => {
            db.get(findTable).then(t => {
                if(t){
                    resolve(db)
                }else{
                    db.run(createTable).then(t => {
                        resolve(db);
                    },reject)
                }
            },reject)
        },reject)
        
    })
}

getDatabase().then(db => {
    db.close();  
});

