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

    router.post('/verify', verify, function(req,res){
        if(req.code){
            var email = req.code.email;
        console.log(email);
        var sql = `select * from user where email = "${email}"; `;
        conn.query(sql,function(err,rows,fields){
            if(err) console.log(err);
            res.send({result:rows[0]});
        });
        }else{
            res.send({login:"login"});
        }
        
    });

    router.post('/upload',verify,function(req,res){
        if(req.code){
            var email = req.code.email;
            var fake = fakeEmail(email);
            console.log("UserComment : "+email);
            var productId = req.body.id;
            var category = req.body.category;
            var stars = req.body.stars;
            var author = req.body.author;
            var password = req.body.password;
            var comment = req.body.comment;
            var params = [email,productId,category,stars,author,password,comment,fake];
            var sql = "insert into quest (email,productId,category,stars,name,password,comment,fake) values(?,?,?,?,?,?,?,?);";
            console.log(params);
            conn.query(sql,params,function(err,rows,fields){
                if(err) console.log(err);
                console.log("uploaded comment: "+email);
                res.send({result:"success"});
            });
        }else{
            console.log("noUserComment");
            var productId = req.body.id;
            var category = req.body.category;
            var stars = req.body.stars;
            var author = req.body.author;
            var password = req.body.password;
            var comment = req.body.comment;
            var params = [productId,category,stars,author,password,comment];
            var sql = "insert into quest (productId,category,stars,name,password,comment) values(?,?,?,?,?,?);";
            console.log(params);
            conn.query(sql,params,function(err,rows,fields){
                if(err) console.log(err);
                console.log("uploaded comment without sinning");
                res.send({result:"success"});
            });
        }
    });

    router.post('/reply',verify,function(req,res){
        if(req.code){
            var email = req.code.email;
            var fake = fakeEmail(email);
            console.log("UserReply : "+email);
            var questId = req.body.qid;
            var productId = req.body.pid;
            var category = req.body.category;
            var author = req.body.author;
            var password = req.body.password;
            var comment = req.body.comment;
            var params = [email,questId,productId,category,author,password,comment,fake];
            var sql = "insert into answ (email,questId,productId,category,name,password,comment,fake) values(?,?,?,?,?,?,?,?);";
            console.log(params);
            conn.query(sql,params,function(err,rows,fields){
                if(err) console.log(err);
                console.log("uploaded reply: "+email);
                res.send({result:"success"});
            });
        }else{
            console.log("noUserReply");
            var questId = req.body.qid;
            var productId = req.body.pid;
            var category = req.body.category;
            var author = req.body.author;
            var password = req.body.password;
            var comment = req.body.comment;
            var params = [questId,productId,category,author,password,comment];
            var sql = "insert into answ (questId,productId,category,name,password,comment) values(?,?,?,?,?,?);";
            console.log(params);
            conn.query(sql,params,function(err,rows,fields){
                if(err) console.log(err);
                console.log("uploaded reply without sinning");
                res.send({result:"success"});
            });
        }
    });

    router.post('/getComments',function(req,res){
        var productId = req.body.id;
        console.log(productId);
        var sql = `select * from quest where productId = "${productId}"; `;
        var sql1 = `select * from answ where productId = "${productId}"; `;
        conn.query(sql,function(err,rows,fields){
            conn.query(sql1,function(err1,rows1,fields){
                if(err) {
                    console.log(err);
                }else if(err1){
                    console.log(err1);
                }else if(rows[0]==undefined && rows1[0] == undefined){
                    res.send({noComments:"noComments"});
                }else{
                    var total;
                    var len = rows.length
                    for(i in rows){
                        total = total + rows[i].stars;
                    }
                    var avg = total/len;
                    console.log("get quest table");
                        if(err1) console.log(err1);
                    console.log("get answ table");
                    console.log(JSON.stringify(rows));
                    console.log(JSON.stringify(rows1));
                    var comments = {
                        quest: rows,
                        answ:rows1,
                        avg:avg,
                        len:len
                    }
                    res.send({comments:comments});                
                }
            });        
        });

    });

    router.post('/edit',verify,function(req,res){
        if(req.code){
            var email = req.code.email;
            console.log("Member checked : "+email);
            var type = req.body.type;
            var id = req.body.id;
            var sql = `select * from ${type} where id = ${id};`;
            conn.query(sql,function(err,rows,fields){
                if(err) console.log(err);
                if(rows[0].email == email){
                    console.log("matched email : "+JSON.stringify(rows));
                    res.send({result:rows});
                }else{
                    console.log("notMatchedEmail");
                    res.send({notMatchingEmail:"notMatchingEmail"});
                }                                
            });
        }else{
            console.log("notMember")
            var type = req.body.type;
            var id = req.body.id;
            var sql = `select * from ${type} where id = ${id};`;
            conn.query(sql,function(err,rows,fields){
                if(err) console.log(err);
                console.log("notMatched : "+JSON.stringify(rows));
                res.send({result1:rows});
            });
        }
    });

    router.post('/editQuest',function(req,res){
        var id = req.body.id;
        var type = req.body.type;
        var comment = req.body.comment;
        var sql = `update ${type} set comment = "${comment}" where id = ${id}; `;
        console.log(sql);
        conn.query(sql,function(err,rows,fields){
            console.log("editQuest");
            if(err) console.log(err);
            res.send({result:"result"});
        });
    });
    router.post('/delQuest',function(req,res){
        var id = req.body.id;
        var type = req.body.type;
        var comment = "삭제된 댓글입니다.";
        var category = "삭제";
        var sql = `update ${type} set comment = "${comment}", category = "${category}" where id = ${id}; `;
        console.log(sql);
        conn.query(sql,function(err,rows,fields){
            console.log("delQuest");
            if(err) console.log(err);
            res.send({result:"result"});
        });
    });
    router.post('/editAnsw',function(req,res){
        var id = req.body.id;
        var type = req.body.type;
        var password = req.body.password;
        var comment = req.body.comment;
        var sql = `select password from ${type} where id = ${id};`;
        var sql1 = `update ${type} set comment = "${comment}" where id = ${id}; `;
        console.log(sql);
        console.log(sql1);
        conn.query(sql,function(err,rows,fields){
            if(err) console.log(err);
            console.log("checkingPassword");
            if(rows[0].password == password){
                conn.query(sql1,function(err,rows,fields){
                    if(err) console.log(err);
                    console.log("editAnsw");
                    res.send({result:"result"});
                });
            }else{
                console.log("wrong password");
                res.send({wrong:"wrong"});
            }
        });
    });
    router.post('/delAnsw',function(req,res){
        var id = req.body.id;
        var type = req.body.type;
        var password = req.body.password;
        var comment = "삭제된 댓글입니다.";
        var category = "삭제";
        var sql = `select password from ${type} where id = ${id};`;
        var sql1 = `update ${type} set comment = "${comment}", category = "${category}" where id = ${id}; `;
        console.log(sql);
        console.log(sql1);
        conn.query(sql,function(err,rows,fields){
            if(err) console.log(err);
            console.log("checkingPassword");
            if(rows[0].password == password){
                conn.query(sql1,function(err,rows,fields){
                    if(err) console.log(err);
                    console.log("delAnsw");
                    res.send({result:"result"});
                });
            }else{
                console.log("PasswordWrong");
                res.send({wrong:"wrong"});
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

    function fakeEmail(str){
        var fake = "";
        var array = str.split('');
        for(var i in array){
          if(array[i] == "@"){
            return fake;
          }else{
            fake = fake + array[i];
          }
        }
      }

    return router;
}