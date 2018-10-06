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

    router.post('/checkDpl',function(req,res){
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

    router.post('/register',function(req,res){
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var sql = "insert into user (`name`,`email`,`password`,`salt`) values(?,?,?,?);";
        hasher({password:password},function(err,pass,salt,hash){
            var params = [name,email,hash,salt];
            var userInfo = {
                email:email,
                password:password
            };
            conn.query(sql,params,function(err,rows,fields){
                console.log("success to register: " + rows);
                jwk.sign(userInfo,"secretkey",function(err,token){
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
    
    router.post('/likeList',verify,function(req,res){
        var email = req.code.email;
        console.log(email);
        var sql = `select postId from likelist where userId ='${email}' `;
        conn.query(sql,function(err,rows,fields){
            if(err) console.log("Couldn't get rows from likeList router... : " + err);
            console.log("get result of likeList : " + rows);
            res.send({result:rows});
        });
    });
    
    router.post('/login',function(req,res){
        var email = req.body.email;
        console.log(email);
        var password = req.body.password;
        var sql = `select email,password,salt from user where email = "${email}"; `;
        conn.query(sql,function(err,rows,fields){
            if(err)console.log("sql error when check the email valid.");
            if(rows[0] == undefined){
                res.send({result:"notMember"});
                console.log("unknown email...");
            }else if(rows[0].email == email){
                console.log("emailMatched");
                console.log(rows[0].password);
                console.log(rows[0].salt);
                hasher({password:password, salt:rows[0].salt},function(err,pass,salt,hash){
                    console.log(password);
                    console.log(hash);
                    if(rows[0].password == hash){
                        console.log("passwordMatched");
                        var params = {
                            email:email,
                            password:password
                        };
                        jwk.sign(params,"secretkey",function(err,token){
                            console.log("publishedToken");
                            res.send({
                                token:token,
                                result:"success"
                            });
                        });
                    }else{
                        console.log("worngPassword");
                        res.send({result:"worngPassword"});
                    }
                });
            }
        });
    })

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






