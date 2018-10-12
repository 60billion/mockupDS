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
        var sql = "select * from product where id = ?";
        conn.query(sql,id,function(err,rows,fields){
            if(err)console.log(err);
            if(rows[0]==undefined){
                console.log(`no data from select * from product where id = ${id}`);
                res.send({failed:"none"});
            };
            res.send({
                result:rows[0]
            });
            console.log(`sent rows[0] from select * from product where id = ${id}`);
        });
    });

    return router;
}