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

    router.post('/likeList',verify,function(req,res){
        var email = req.code.email;
        console.log(email);
        var sql = `select postId from likelist where userId ='${email}';`;
        var sql1 = `select name  from user where email = '${email}';`;
        conn.query(sql1, function(err,rows,fields){
            var name = rows[0].name;
            conn.query(sql,function(err,rows,fields){
                if(err) console.log("Couldn't get rows from likeList router... : " + err);
                console.log("get result of likeList : " + rows);
                console.log(JSON.stringify(rows));

                if(rows[0]){
                    var array = [];

                    for(var i = 0; i < rows.length; i++ ){
                        array.push(parseInt(rows[i].postId));
                    }

                    console.log(array);
                    var sql2 = `select * from product where id in (${array});`
                    conn.query(sql2,array,function(err,rows,fields){
                        if(err) console.log(err);
                        console.log("got products info");
                        console.log(JSON.stringify(rows));
                        
                        var even = [];
                        var odd = [];

                        for(var i = 0; i < rows.length; i++ ){
                            if(i%2 == 0 ){
                                even.push(rows[i]);
                            }else{
                                odd.push(rows[i]);
                            }
                        }

                        console.log(even);
                        console.log(odd);

                        var result = {
                            email:email,
                            name:name,
                            even:even,
                            odd:odd
                        }
                        res.send({result:result});
                    });
                }else if(rows[0] == undefined){
                    var noLikes = {
                        email:email,
                        name:name
                    };
                    res.send({noLikes:noLikes});
                }
    
                
            });
        });

    });

    router.post("/likeButton",verify,function(req,res){
        var email = req.code.email;
        var id = req.body.id;
        console.log(email, id);
        var sql1 = `select * from likelist where userId = "${email}" and postId = "${id}";`;
        var sql2 = `delete from likelist where userId = "${email}" and postId = "${id}"`;
        var sql3 = `delete from productLikes where productId = "${id}" and likeWho = "${email}"`;
        var sql4 = `insert into likelist (userId,postId) values("${email}","${id}");`;
        var sql5 = `insert into productLikes(productId,likeWho) values("${id}","${email}");`;
        conn.query(sql1,function(err,rows,fields){
            if(rows[0] == undefined){
                conn.query(sql4,function(err,rows,fields){
                    if(err) console.log(err);
                    console.log("added likelist");
                    conn.query(sql5,function(err,rows,fields){
                        if(err) console.lof(err);
                        console.log("added productLikes");
                        res.send({added:"added"});
                    });
                });
            }else if(rows[0]){
                conn.query(sql2,function(err,rows,fields){
                    if(err) console.log(err);
                    console.log("deleted likelike row");
                    conn.query(sql3,function(err,rows,fields){
                        if(err) console.log(err);
                        console.log("deleted productLikes row");
                        res.send({deleted:"deleted"});
                    });
                });
            }
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