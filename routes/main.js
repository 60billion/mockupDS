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

    router.post("/getList",function(req,res){
        console.log("Post/main/getList")
        var sql = "select * from product;";
        conn.query(sql,function(err,rows,fields){
            if(err) console.log(err);
            res.send({
                result:rows
            });
            console.log("sent rows from select * from product");
        });
    });

    router.post("/getProductInfo",function(req,res){
        console.log("Post/main/getProductInfo");
        var id = req.body.id;
        console.log("id : "+ id );
        var sql = `select * from product where id = ${id}`;
        conn.query(sql,function(err,rows,fields){
            if(err){
                console.log(err);
            }else if(rows[0]==undefined){
                console.log(`no data from select * from product where id = ${id}`);
                res.send({failed:"none"});
            }else{
                res.send({
                    result:rows
                });
                console.log(`sent rows from select * from product where id = ${id}`);
                console.log(JSON.stringify(rows));
            }
        });
    });

    router.post("/profileList",function(req,res){
        console.log("Post/main/prodileList");
        var infId = req.body.id;
        console.log(infId);
        var sql = `select productId from inf where id = ${infId}`;
        conn.query(sql,function(err,rows,fields){
            console.log("getting productId from inf table.");
            if(rows[0]==undefined){
                res.send({failed:"failed"});
            }else{
                console.log(JSON.stringify(rows));
            }
        })
    });

    return router;
}