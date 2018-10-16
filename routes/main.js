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

    router.post("/getList",verify, function(req,res){
        if(req.code){
            var email = req.code.email;
            console.log(email);
            console.log("Post/main/getList")
            var sql = "select * from product;";
            var sql1 = `select postId from likelist where userId = "${email}";`;
            conn.query(sql,function(err,rows,fields){
                conn.query(sql1,function(err1,rows1,fields){
                    if(err) console.log(err1);
                    if(err) console.log(err);
                    if(rows1[0] == undefined){
                        res.send({result:rows});
                    }else{
                        for( i in rows){
                            console.log("loop1");
                            for( k in rows1){
                                console.log("loop2");
                                if(rows[i].id == rows1[k].postId){
                                    rows[i].likeStatus = "true";
                                }
                            }
                        }
                        res.send({result:rows});
                        console.log("sent rows from select * from product");
                    }
                });
            });
        }else{
            var token = req.noToken
            console.log(token);
            var sql = "select * from product;";
            conn.query(sql,function(err,rows,fields){
                if(err) console.log(err);
                res.send({result:rows});
            });
        }

    });

    router.post("/getProductInfo",verify, function(req,res){
        if(req.noToken){
            console.log("Post/main/getProductInfo/noToken");
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
        }else{
            var email = req.code.email;
            console.log("Post/main/getProductInfo/token");
            var id = req.body.id;
            console.log("id : "+ id );
            var sql = `select * from product where id = ${id}`;
            var sql1 = `select postId from likelist where userId = "${email}";`;
            conn.query(sql,function(err,rows,fields){
                conn.query(sql1, function( err1, rows1, fields){
                    if(err){
                        console.log(err);
                    }else if(err1){
                        console.log(err1);
                    }else if(rows[0]==undefined){
                        console.log(`no data from select * from product where id = ${id}`);
                        res.send({failed:"none"});
                    }else{
                        console.log("checking liklist from user")
                        for(i in rows1){
                            if(rows[0].id == rows1[i].postId){
                                rows[0].likeStatus = "true";
                            }
                        }
                        res.send({
                            result:rows
                        });
                        console.log(`sent rows from select * from product where id = ${id}`);
                        console.log(JSON.stringify(rows));
                    }
                });
            });
        }

    });

    router.post("/profileList",function(req,res){
        console.log("Post/main/prodileList");
        var infId = req.body.id;
        console.log(infId);
        var sql = `select productId from inf where id = ${infId}`;
        conn.query(sql,function(err,rows,fields){
            console.log("getting productId from inf table.");
            if(err) {
                console.log(err);
                res.send({failed:"failed"});
            }else if(rows[0]==undefined){
                res.send({failed:"failed"});
            }else{
                console.log(JSON.stringify(rows[0].productId));
                var array = rows[0].productId.split(",");
                var sql = `select * from product where id in (${array});`;
                conn.query(sql,function(err,rows,fields){
                    console.log(`getting product list from product tabe where id =${array} `);
                    console.log(JSON.stringify(rows));
                    var even = [];
                    var odd = [];
                    var profileImg = rows[0].profileImg;
                    var name = rows[0].name;
                    for(var i = 0; i < rows.length; i++){
                        if(i%2==0){
                            even.push(rows[i]);
                            console.log(rows[i]);
                        }else{
                            odd.push(rows[i]);
                            console.log(rows[i]);
                        }
                    }
                    console.log(even);
                    console.log(odd);
                    console.log(profileImg);
                    console.log(name);
                    var result = {
                        even:even,
                        odd:odd,
                        profileImg:profileImg,
                        name:name
                    }
                    res.send({result:result});
                });
            }
        });
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