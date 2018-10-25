module.exports = function(app){
    var express = require('express');
    var bodyparser = require('body-parser');
    var logger = require('morgan');
    var methodOverride = require('method-override');
    var cors = require('cors');
    var pbkfd2Password = require('pbkdf2-password');
    var hasher = pbkfd2Password();
    var jwk = require('jsonwebtoken');

    app.use(logger('dev'));
    app.use(bodyparser.json());
    app.use(methodOverride());
    app.use(cors());

    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host:"testdatabase.c3asktw2nxxm.ap-northeast-2.rds.amazonaws.com",
        user:"root",
        password:"11131113",
        database:"mockup"
    });

    var router = express.Router();


    router.post('/selectItem', verify, function(req,res){
        console.log("POST BUTY SELECT ITEM");
        if(req.code){
            var pdId = req.body.id;
            console.log(pdId);
            var sql = `select * from product where id = ${pdId};`;
            var sql1 = `select * from purchase where productId = ${pdId}`;
            console.log("memberProcess for getting item list");
            conn.query(sql,function(err,rows,fields){
                if(err) console.log(err);
                conn.query(sql1,function(err,rows1,fields){
                    if(err) console.log(err);
                    console.log(JSON.stringify(rows));
                    console.log(JSON.stringify(rows1));
                    var result = {
                        productInfo: rows,
                        ItemInfo: rows1
                    }
                    res.send({result:result});
                    console.log("sent result");
                });
            });
        }else{
            var pdId = req.body.id;
            console.log(pdId);
            var sql = `select * from product where id = ${pdId};`;
            var sql1 = `select * from purchase where productId = ${pdId}`;
            console.log("noLoginProcess for getting item list");
            conn.query(sql,function(err,rows,fields){
                if(err) console.log(err);
                conn.query(sql1,function(err,rows1,fields){
                    if(err) console.log(err);
                    console.log(JSON.stringify(rows));
                    console.log(JSON.stringify(rows1));
                    var result1 = {
                        productInfo: rows,
                        ItemInfo: rows1
                    }
                    res.send({result1:result1});
                    console.log("sent result1");
                });
            });
        }
    });
    

    function verify (req,res,next){
        const token = req.body.tokens;
        console.log("verified: "+ token);
        if(!token || token == undefined){
            req.noToken = "noToken";
            next();
        }else{
            jwk.verify(token,'secretkey',(err,code)=>{
                if(err){
                    console.log("jwk verify err: "+ err);
                }else{
                    req.code = code;
                    console.log(code);
                    next();
                }
            });
        }
    }

    return router;
}