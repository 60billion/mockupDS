var express = require('express');
var bodyparser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var cors = require('cors');
var pbkfd2Password = require('pbkdf2-password');
var hasher = pbkfd2Password();
var jwk = require('jsonwebtoken');
//서버구동
var app = express();
app.use(logger('dev'));
app.use(bodyparser.json());
app.use(methodOverride());
app.use(cors());

//데이터베이스 접속
var mysql = require('mysql');
var conn = mysql.createConnection({
	host:"testdatabase.c3asktw2nxxm.ap-northeast-2.rds.amazonaws.com",
    user:"root",
    password:"11131113",
    database:"mockup"
})
conn.connect(function(){
    console.log("connected database!!")
});

//아마존 접속
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();

app.get('/',function(req,res){
	res.send('health test');
});

app.post('/checkDpl',function(req,res){
    console.log("working");
    var email = req.body.email;
    console.log(email);
    var sql = `select email from user where email = "${email}";`;
    conn.query(sql,function(err,rows,fields){
        console.log(rows);
        console.log(JSON.stringify(rows));
        if(rows[0] == undefined){
            res.send({result:"valid"});
            console.log("valid");
        }else{
            res.send({result:"duplicated"});
            console.log("duplicated")
        }
    })
});

app.post('/register',function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var sql = "insert into user ('name','email','password','salt') values(?,?,?,?);";
    hasher({password:password},function(err,pass,salt,hash){
        var params = [name,email,hash,salt];
        conn.query(sql,params,function(err,rows,fields){
            console.log("success to register: " + email);
            jwk.sign(params,"secretkey",function(err,token){
                if(err){
                    console.log("Couldn't register and give token to "+email);
                    res.send({result:"failed"})
                }else{
                    console.log("registered and give token for "+ email)
                    res.send({success:token});
                }
            });
        });
    });
});

function verify (req,res,next){
    const token = req.body.tokens;
    console.log("verified: "+ token);
    if(!token || token == undefined){
        return res.send({
            login:'login'
        });
    }else{
        jwk.verify(token,'secretkey',(err,code)=>{
            if(err){
                console.log("jwk err: "+ err);
            }else{
                res.code = code;
                next();
            }
        });
    }
}

app.listen(9000, function(){
    console.log("connected server!!")
});
