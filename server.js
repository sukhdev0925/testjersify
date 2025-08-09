var express=require("express");
var fileuploader=require("express-fileupload");
var cloudinary=require("cloudinary").v2;
var mysql2=require("mysql2");
var app=express();//app() returns an Object:app
app.use(fileuploader());//for receiving files from client and save on server files


app.listen(2000,function(){
    console.log("Server Started at Port no: 2000")
})

app.use(express.static("public"));//for index file
app.get("/",function(req,resp)
{
    console.log(__dirname);
    console.log(__filename);

    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
})
app.use(express.urlencoded(true));
cloudinary.config({ 
            cloud_name: 'dkpzh80rf', 
            api_key: '175984442581799', 
            api_secret: 'TyHlwhi7iiFy_GUQSDsLpXp_TvI' // Click 'View API Keys' above to copy your API secret
        });

//building connection between aiven and MySql
let dbConfig="mysql://avnadmin:AVNS_bdAYlR7V7Bpfvd3pth8@mysql-1a12b933-sukhdevrajpal84-8783.j.aivencloud.com:27061/defaultdb?"; 
let mysqlven = mysql2.createPool(dbConfig);
console.log("Aiven connected sucessfully");
// mysqlven.connect(function(errKuch)
// {
//     if (errKuch==null)
//          console.log("Aiven connected sucessfully");

//     else
//         console.log(errKuch.message)
// })



//for signing up//
//     app.post("/signup",function(req,resp)
//     {   
        
//         let pwd=req.body.StxtPwd;
//         let utype=req.body.Stxtutype;
//         let emailid=req.body.StxtEmail;

//         mysqlven.query("insert into users values(?,?,?,1,current_date())",[emailid,pwd,utype],function(errKuch)
//         {
//                 if(errKuch==null)
//                     resp.send("Record Saved Successfulllyyy....Badhai");
//                 else 
//                     resp.send(errKuch)   
//         })
// })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAxkmotr0OJxea354yI_i9Z9dwesx3DG4k");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });









// app.get("/ai", function (req, resp) {

//     // resp.sendFile();
//     let dirName = __dirname;//Global Variable for path of current directory
//     //let filename=__filename;
//     //resp.send(dirName+"  <br>     "+filename);
//     let fullpath = dirName + "/public/frontAi.html";
//     resp.sendFile(fullpath);
// })

// app.post("/abc", async function (req, resp) {
//     console.log(req.body);
//     let txt = req.body.txtttt;

//     let prompt=txt + " Give response in JSON object with key message"

//     const result = await model.generateContent(prompt);

//     resp.send(result.response.text());

// })

//--------------------------------------------------------

async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}
app.post("/PlayerdetailsSAVE", async function (req, resp) {

////////////////////////////////////////////////acard////////////////////////////////////
   let fileName;
    let Data;
    let acardpicurl;//for acard
    console.log(acardpicurl);
    let picurl;//for profile
        if(req.files!=null)
    {
        let fName=req.files.ProfPic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.ProfPic.mv(fullPath);
        try{
        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl+"URL OF PROFILE");
      }
    ); 
}
catch(err)
        {   console.log(err.message+"****");
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            return;
            
           // resp.send("Oops, An Error occured while uploading Data. Please try again later.")
        }
    }
    else
        picurl="nopic.jpg";
//////////////////////////////mysql


   
    if (req.files != null) 
        {let fileName;
                   //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.AadhaarFPic.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path
        
        req.files.AadhaarFPic.mv(locationToSave);//saving file in uploads folder
        console.log("2nd");
        
        //saving ur file/pic on cloudinary server
        try{
                console.log("cloudinary starts");
        await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
            console.log(" started");

                 acardpicurl=picUrlResult.url;
                console.log(acardpicurl+" adhaar card url");
            let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
            console.log(jsonData);
            // Data=jsonData;
            
            // resp.send(jsonData);

            mysqlven.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[req.body.PEmailid,acardpicurl,picurl,jsonData.name,jsonData.dob,jsonData.gender,req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo],function(err,allRecords)
        {   if(err!=null)
        {
            console.log(err+"mysql err");
             let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
            
                
            else{
               let path=__dirname+"/public/saved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            }
        })
        });

        //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
        // resp.send(respp);
        // console.log(typeof(respp));
        }
        
        catch(err)
        {   console.log(err.message+"****"+acardpicurl);
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            
           // resp.send("Oops, An Error occured while uploading Data. Please try again later.")
        }

    }
    // console.log(Data);
    
    
     



})
//////////////////////////////////////////////////////
app.post("/PDetailsModify", async function (req, resp){
//    var file = [];
// var fileKeys = Object.keys(req.files);

//     console.log(fileKeys);
if (req.files == null) 
        {
             mysqlven.query("UPDATE players SET address=? , contact =? , game=? , otherinfo=? WHERE emailid=?",[req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo,req.body.PEmailid],function(err,allRecords)
        {   if(err!=null)
        {
            console.log(err+"mysql err");
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
            
                
            else{
                 let path=__dirname+"/public/saved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            }
        })
    }


    if (req.files != null){ 
        let fileName;
    let Data;
    let acardpicurl;//for acard
    let picurl;//for profile
    if (req.files && Array.isArray(req.files)){
        if (req.files.AadhaarFPic.name != null && req.files.ProfPic.name!=null){
             {
        let fName=req.files.ProfPic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.ProfPic.mv(fullPath);
try{
        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl+"URL OF PROFILE");
      });
    }catch(err)
        {   console.log(err.message+"****"+acardpicurl);
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            
           // resp.send("Oops, An Error occured while uploading Data. Please try again later.")
        }
    }
        {let fileName;
                   //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.AadhaarFPic.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path
        
        req.files.AadhaarFPic.mv(locationToSave);//saving file in uploads folder
        console.log("2nd");
        
        //saving ur file/pic on cloudinary server
        try{
                console.log("cloudinary starts");
        await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
            console.log(" started");

                 acardpicurl=picUrlResult.url;
                console.log(acardpicurl+" adhaar card url");
            let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
            console.log(jsonData);
            // Data=jsonData;
            
            // resp.send(jsonData);

            mysqlven.query("UPDATE players SET acardpicurl=? , profilepicurl=? , name=? , dob=? , gender=? , address=? , contact =? , game=? , otherinfo=? WHERE emailid=?",[acardpicurl,picurl,jsonData.name,jsonData.dob,jsonData.gender,req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo,req.body.PEmailid],function(err,allRecords)
        {   if(err!=null)
        {
            console.log(err+"mysql err");
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
            
                
            else{
                let path=__dirname+"/public/saved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            }
        })
        });

        //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
        // resp.send(respp);
        // console.log(typeof(respp));
        }
        
        catch(err)
        {   console.log(err.message+"****"+acardpicurl);
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
    }}
}
  else  if (req.files){
 if (Object.keys(req.files).some(fieldName => fieldName.includes('ProfPic'))){
         { console.log(req.files.ProfPic.name);
        let fName=req.files.ProfPic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.ProfPic.mv(fullPath);
try{
        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl+"URL OF PROFILE");
      });
    }catch(err)
        {   console.log(err.message+"****"+acardpicurl);
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            
           // resp.send("Oops, An Error occured while uploading Data. Please try again later.")
        }
    
     mysqlven.query("UPDATE players SET profilepicurl=? , address=? , contact =? , game=? , otherinfo=? WHERE emailid=?",[picurl,req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo,req.body.PEmailid],function(err,allRecords)
        {   if(err!=null)
        {
            console.log(err+"mysql err");
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
            
                
            else{
                let path=__dirname+"/public/saved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            }
        })
    }}
   else if (Object.keys(req.files).some(fieldName => fieldName.includes('AadhaarFPic'))){
{let fileName;
                   //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.AadhaarFPic.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path
        
        req.files.AadhaarFPic.mv(locationToSave);//saving file in uploads folder
        console.log("2nd");
        
        //saving ur file/pic on cloudinary server
        try{
                console.log("cloudinary starts");
        await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
            console.log(" started");

                 acardpicurl=picUrlResult.url;
                console.log(acardpicurl+" adhaar card url");
            let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
            console.log(jsonData);
            // Data=jsonData;
            
            // resp.send(jsonData);

            mysqlven.query("UPDATE players SET acardpicurl=? , name=? , dob=? , gender=? , address=? , contact =? , game=? , otherinfo=? WHERE emailid=?",[acardpicurl,jsonData.name,jsonData.dob,jsonData.gender,req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo,req.body.PEmailid],function(err,allRecords)
        {   if(err!=null)
        {
            console.log(err+"mysql err");
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }
            
                
            else{
                let path=__dirname+"/public/saved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
            }
        })
        });

        //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
        // resp.send(respp);
        // console.log(typeof(respp));
        }
        
        catch(err)
        {   console.log(err.message+"****"+acardpicurl);
            let path=__dirname+"/public/unsaved2.html";
    resp.sendFile(path);
            resp.sendFile(path);
        }

    }
 
    }
}
}

})


// app.post("/aaar", async function (req, resp) {
//     if(req.files!=null)
//     {
//         let fName=req.files.ProfPic.name;
//         let fullPath=__dirname+"/public/uploads/"+fName;
//         req.files.ProfPic.mv(fullPath);

//         await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
//         {
//             picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

//             console.log(picurl);
//       });
//     }
//     else
//         picurl="nopic.jpg";
//     // /////////////////////////////////////////////acard
//      if(req.files!=null)
//     {
//         let fName=req.files.AadhaarFPic.name;
//         let fullPath=__dirname+"/public/uploads/"+fName;
//         req.files.AadhaarFPic.mv(fullPath);

//         await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
//         {
//             Acardpicurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

//             console.log(picurl);
//       });
//     }
//     else
//         picurl="nopic.jpg";
//     let fileName;
//     if (req.files != null) 
//         {
//        //const myprompt = "Read the text on picture and tell all the information";
//         //  const myprompt = "Read the text on picture in JSON format";
        
      
                
//             let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
//             console.log(jsonData);
//             // resp.send(jsonData);
//         //    mysqlven.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[req.query.PEmailid,picUrlResult.url,picurl,jsonData.name],function(err,allRecords)
//         // {
//         //     if(allRecords.length==0)
//         //         resp.send("Availale.");
//         //     else
//         //         resp.send("This Email id is already Taken.");
//         // })
//         }

//         //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
//         // resp.send(respp);
//         // console.log(typeof(respp));
        
//     });

    


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// let fileName;
//     let Data;
//     let acardpicurl;//for acard
//     let picurl;//for profile
//         if(req.files!=null)
//     {
//         let fName=req.files.ProfPic.name;
//         let fullPath=__dirname+"/public/uploads/"+fName;
//         req.files.ProfPic.mv(fullPath);

//         await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
//         {
//             picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

//             console.log(picurl+"URL OF PROFILE");
//       });
//     }
//     else
//         picurl="nopic.jpg";
// //////////////////////////////mysql


    
//     if (req.files != null) 
//         {
//        //const myprompt = "Read the text on picture and tell all the information";
//         //  const myprompt = "Read the text on picture in JSON format";
//         fileName = req.files.AadhaarFPic.name;
//         let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path
        
//         req.files.AadhaarFPic.mv(locationToSave);//saving file in uploads folder
//         console.log("2nd");
        
//         //saving ur file/pic on cloudinary server
//         try{
//                 console.log("cloudinary starts");
//         await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
//             console.log(" started");

//                  acardpicurl=picUrlResult.url;
//                 console.log(acardpicurl+" adhaar card url");
//             let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
//             // Data=jsonData;
            
//             // resp.send(jsonData);

//             mysqlven.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[req.body.PEmailid,acardpicurl,picurl,jsonData.name,jsonData.gender,jsonData.dob,req.body.PAddress,req.body.PContact,req.body.PGames,req.body.POtherinfo],function(err,allRecords)
//         {   if(err!=null)
//         {
//             console.log(err+"mysql err");
//         }
            
                
//             else
//                 resp.send("Record saved sucessfully");
//         })
//         });

//         //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
//         // resp.send(respp);
//         // console.log(typeof(respp));
//         }
        
//         catch(err)
//         {   console.log(err.message);
//             resp.send(err.message)
//         }

//     }
//     // console.log(Data);
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get("/chk-email",function(req,resp){
    
 mysqlven.query("select * from users where emailid=?",[req.query.StxtEmail],function(err,allRecords)
        {
            if(allRecords?.length==0)
                resp.send("Available.");
            else
                resp.send("This Email id is already Taken.");
        })
})
app.get("/Ajax-signup",function(req,resp){
    

     mysqlven.query("insert into users values(?,?,?,1,current_date())",[req.query.StxtEmail,req.query.StxtPwd,req.query.Stxtutype],function(errKuch)
        {
                if(errKuch!=null)
                    resp.send("Record Saved Successfulllyyy....");
                else 
                    resp.send(errKuch)
                console.log(errKuch);
        })
})
// app.get("/AJAX-login", function (req, resp) {
//     let emailid = req.query.LtxtEmail;
//     // let pwd = req.query.LtxtPwd;
//     mysqlven.query("select * from users where emailid=?", [emailid], function (err,selected) {

//         if (selected.length==1) {
//             let status = allRecords[0].status;

//             if (status == 0)
//                 resp.send("Blocked");
//             else if (status == 1)
//                 resp.send("Login Succesful");
            
//         }
//         else {
//             resp.send("Wrong Emailid OR Password");
//         }
//         console.log(selected);
//         console.log(err);

//     });
// })
app.get("/login", function (req, resp) {
    let emailid = req.query.loginemail;
    let pwd = req.query.loginpwd;

    let query = "SELECT * FROM users WHERE emailid = ? AND pwd = ?";

    mysqlven.query(query,[emailid,pwd],function(err,allRecords)
     {

        if (allRecords?.length == 1) {
            let status = allRecords[0].status;

            if (status == 0)
                resp.send("Blocked");
            else if (status == 1)
                resp.send(allRecords[0].utype);
            
        }
        else {
            resp.send("invalid!");
        }

    });
});
app.get("/show-org-dashboard",function(req,resp){
    let path=__dirname+"/public/org-dash.html";
    resp.sendFile(path);
})
// /////////////////////////////////////////////////////////////////////////
app.get("/i",function(req,resp){
    let path=__dirname+"/public/index2.html";
    resp.sendFile(path);
})
// //////////////////////////////////////////////////////

app.get("/org-details",function(req,resp){
    let path=__dirname+"/public/organizer-details.html";
    resp.sendFile(path);
})

app.get("/org-Events",function(req,resp){
    let path=__dirname+"/public/organizer-Tournament.html";
    resp.sendFile(path);
})
app.get("/show-Admin-dashboard",function(req,resp){
    let path=__dirname+"/public/AdminDash.html";
    resp.sendFile(path);
})
app.get("/org-FetchAll",function(req,resp){
    let path=__dirname+"/public/fetchAllHttp.html";
    resp.sendFile(path);
})

app.get("/Admin-All",function(req,resp){
    let path=__dirname+"/public/Admin-ShowAll.html";
    resp.sendFile(path);
})

app.get("/Admin-Players",function(req,resp){
    let path=__dirname+"/public/Admin-ShowPlayers.html";
    resp.sendFile(path);
})
app.get("/Admin-Organizers",function(req,resp){
    let path=__dirname+"/public/Admin-ShowOrganizers.html";
    resp.sendFile(path);
})
app.get("/Explore-Events",function(req,resp){
    let path=__dirname+"/public/ExploreEvents.html";
    resp.sendFile(path);
})

app.get("/show-Player-dashboard",function(req,resp){
    let path=__dirname+"/public/PlayerDash.html";
    resp.sendFile(path);
})
app.get("/Player-details",function(req,resp){
    let path=__dirname+"/public/Player-details.html";
    resp.sendFile(path);
})
app.post("/Ajax-orgdetailsSAVE",async function(req,resp){
    
let picurl="";
    if(req.files!=null)
    {
        let fName=req.files.orgprofilePic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.orgprofilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
      });
    }
    else
        picurl="nopic.jpg";



     mysqlven.query("insert into organizers values(?,?,?,?,?,?,?,?,?,?,?,?)",[req.body.orgEmailid,req.body.orgOrgname,req.body.orgRegnum,req.body.orgAddr,req.body.orgCity,req.body.orgSports,req.body.orgWeb,req.body.orgInsta,req.body.orgHead,req.body.orgContact,picurl,req.body.orgOtherinfo],function(errKuch)
              {  if(errKuch==null){
                     let path=__dirname+"/public/saved.html";
    resp.sendFile(path);
                    resp.sendFile(path);
              }
                else 
                   {
                    let path=__dirname+"/public/unsaved.html";
    resp.sendFile(path);
              
                    resp.sendFile(path);
                console.log(errKuch);}
        })
})

app.post("/OrgDetailsModify",async function(req,resp){
    console.log(req.files);
    
let picurl="";
    if(req.files!=null)
    {
        let fName=req.files.orgprofilePic.name;
        let fullPath=__dirname+"/public/uploads/"+fName;
        req.files.orgprofilePic.mv(fullPath);
try{
        await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
        {
            picurl=picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
             mysqlven.query("UPDATE organizers SET orgname=?, regnumber=?, address=?, city=?, sports=?, website=?, insta=?, head=?, contact=?, picurl=?, otherinfo=?  where emailid=?",[req.body.orgOrgname,req.body.orgRegnum,req.body.orgAddr,req.body.orgCity,req.body.orgSports,req.body.orgWeb,req.body.orgInsta,req.body.orgHead,req.body.orgContact,picurl,req.body.orgOtherinfo,req.body.orgEmailid],function(errKuch)
              {  if(errKuch==null){
                    let path=__dirname+"/public/saved.html";
    resp.sendFile(path);
              
                    resp.sendFile(path);}
                else {
                    {
                    let path=__dirname+"/public/unsaved.html";
                    resp.sendFile(path);
              
                    resp.sendFile(path);}
                console.log(errKuch);
            }
        })
      });
    }
    catch(err)
        {   console.log(err.message+"****");
            let path=__dirname+"/public/unsaved.html";
    resp.sendFile(path);
            // resp.sendFile(path);
            
           // resp.send("Oops, An Error occured while uploading Data. Please try again later.")
        }

      
    }
    else
    {


     mysqlven.query("UPDATE organizers SET orgname=?, regnumber=?, address=?, city=?, sports=?, website=?, insta=?, head=?, contact=?, otherinfo=?  where emailid=?",[req.body.orgOrgname,req.body.orgRegnum,req.body.orgAddr,req.body.orgCity,req.body.orgSports,req.body.orgWeb,req.body.orgInsta,req.body.orgHead,req.body.orgContact,req.body.orgOtherinfo,req.body.orgEmailid],function(errKuch)
              {  if(errKuch==null)
                    {
                    let path=__dirname+"/public/saved.html";
    resp.sendFile(path);
              
                    resp.sendFile(path);}
                else 
                   { let path=__dirname+"/public/unsaved.html";
    resp.sendFile(path);
                   
                console.log(errKuch+"cloudinary error");}
        })
    }
})

app.get("/Ajax-Org-Details-Search",function(req,resp){
    console.log("org details page loaded");
    let Emailid=req.query.orgEmailid;
    mysqlven.query("select * from organizers where emailid=?",[Emailid],function(err,allRecords){
        //let x=allRecords.length;
        //console.log(x);
        if(allRecords?.length==0){
            resp.send("No Records Found ");
            console.log(allRecords?.length);
        }
        else
        resp.json(allRecords);
    })
})
app.get("/Ajax-Player-Details-Search",function(req,resp){
    let Emailid=req.query.PEmailid;
    mysqlven.query("select * from players where emailid=?",[Emailid],function(err,allRecords){
        if(allRecords?.length==0){
            resp.send("No Records Found ");
            console.log(allRecords?.length);
        }
        else
        resp.json(allRecords);
    })
})
app.get("/Ajax-Tour-Publish",function(req,resp){
    mysqlven.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[null,req.query.TourEmailid,req.query.TourTitle,req.query.TourDate,req.query.TourTime,req.query.TourAdd,req.query.TourCity,req.query.TourSports,req.query.TourMinage,req.query.TourMaxage,req.query.TourRegDate,req.query.TourFee,req.query.TourPrize,req.query.TourContact],function(errkuch,allRecords)
       {  if(errkuch==null)
                    resp.send("Published");
                else 
                    resp.send(errkuch)
                console.log(errkuch);
        })
})
app.get("/Do-Fetch-TournamentsByEmailid",function(req,resp)
{console.log(req.query.emailid);
        mysqlven.query("select * from tournaments where emailid=?",[req.query.emailid],function(err,allRecords)
        {
                    resp.send(allRecords);
                            console.log(err);
        })

})
// ////////////////////////////
app.get("/delete-Tournaments",function(req,resp)
{
    console.log(req.query)
    let rid=req.query.rid;

    mysqlven.query("delete from tournaments where rid=?",[rid],function(errKuch,result)
    {
        if(errKuch==null)
                {
                    result.affectedRows==1
                        resp.send(" Deleted Successfulllyyyy...");
                    
                }
                else
                resp.send(errKuch);

    })
}) 
///////////////////////////////////////

app.get("/do-fetch-all-users",function(req,resp)
{
        mysqlven.query("select * from users",[],function(err,allRecords)
        {
                    resp.send(allRecords);
                            //console.log(err);
        })

})
/////
app.get("/Block-User",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 0 WHERE emailid=?",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})
app.get("/UnBlock-User",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 1 WHERE emailid=?",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})


///////////////////////////////////////players
app.get("/do-fetch-all-Players",function(req,resp)
{
        mysqlven.query("select * from users where utype='Player'",[],function(err,allRecords)
        {
                    resp.send(allRecords);
                            //console.log(err);
        })

})
/////
app.get("/Block-Player",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 0 WHERE emailid=? and utype='Player'",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})
app.get("/UnBlock-Player",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 1 WHERE emailid=? and utype='Player'",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})

///////////////////////////////////////organizers
app.get("/do-fetch-all-Organizer",function(req,resp)
{
        mysqlven.query("select * from users where utype='Organizer'",[],function(err,allRecords)
        {
                    resp.send(allRecords);
                            //console.log(err);
        })

})
/////
app.get("/Block-Organizer",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 0 WHERE emailid=? and utype='Organizer'",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})

app.get("/UnBlock-Organizer",function(req,resp)
{console.log(req.query);
        mysqlven.query("UPDATE users SET status = 1 WHERE emailid=? and utype='Organizer'",[req.query.emailid],function(err,allRecords)
        {if(err==null)
        {
                    resp.send(allRecords);
                            console.log(err);
                            console.log(allRecords);
        }
        else 
            resp.send(err);
            console.log(err);
            console.log(allRecords);
        })

})


///////////////////////////explore events

// app.get("/do-fetch-all-Tournaments",function(req,resp)
// {
//         mysqlven.query("select * from tournaments ",[],function(err,allRecords)
//         {
//                     resp.send(allRecords);
//                             console.log(err);
//         })

// })
/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
app.get("/do-fetch-all-tournaments",function(req,resp)
{   
    console.log(req.query);
    if(req.query.kuchGame==''&& req.query.kuchCity==''){
        return;
    }
    
    if(req.query.kuchGame==''&& req.query.kuchCity!='null')
    {
         mysqlven.query("select * from tournaments where city=?",[req.query.kuchCity],function(err,allRecords)
        {
          console.log(allRecords)
                    resp.send(allRecords);
                    console.log(err);
        })
    }
   
   if(req.query.kuchCity==''&& req.query.kuchGame!='null')
    {console.log(req.query)
        mysqlven.query("select * from tournaments where sports=?",[req.query.kuchGame],function(err,allRecords)
        {
          console.log(allRecords)
                    resp.send(allRecords);
                    console.log(err);
        })
    }
    if(req.query.kuchCity!=''&& req.query.kuchGame!='')
    {mysqlven.query("select * from tournaments where city=? and sports=?",[req.query.kuchCity,req.query.kuchGame],function(err,allRecords)
        {
          console.log(allRecords)
                    resp.send(allRecords);
                    console.log(err);
        })
    }
    // if(req.query.kuchCity!='null'&& req.query.kuchGame!='undefined')
    // {console.log(req.query)
    //     mysqlven.query("select * from tournaments where city=? and sports=?",[req.query.kuchCity,req.query.kuchGame],function(err,allRecords)
    //     {
    //       console.log(allRecords)
    //                 resp.send(allRecords);
    //                 console.log(err);
    //     })
    // }
})


app.get("/do-fetch-all-cities",function(req,resp)
{   let game=req.query.kuchGame;
    console.log(game);
    if(game!=""){
         mysqlven.query("select distinct city from tournaments where sports=?",[game],function(err,allRecords)
        {
                    resp.send(allRecords);
                    console.log(allRecords);
        })
    }
    else{
        mysqlven.query("select distinct city from tournaments",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
    }
})
app.get("/do-fetch-all-sports",function(req,resp)
{   
    let city=req.query.kuchCity;
    console.log(city);
    if(city!=""){
    mysqlven.query("select distinct sports from tournaments where city=?",[city],function(err,allRecords)
        {
                    resp.send(allRecords);
        })
    }
    else{
        mysqlven.query("select distinct sports from tournaments",function(err,allRecords)
        {
                    resp.send(allRecords);
        })}
})

app.get("/do-Check-Email-Pwd",function(req,resp)
{   let Email=req.query.Email;
    let Pwd=req.query.Pwd;
        console.log(Email);
        console.log(Pwd); 
        mysqlven.query("SELECT * FROM users WHERE emailid = ? AND pwd = ?",[Email,Pwd],function(err,allRecords)
        {console.log(allRecords.length);
                    if(allRecords.length==1)
                    {   
                        resp.send("Good");
                    }
                    else{
                        resp.send("Bad");
                    }
                    
        })
})
app.get("/do-Change-Pwd",function(req,resp)
{   let emailid=req.query.Email;
    let pwd= req.query.Pwd;
    let NewPwd=req.query.NewPwd;
    
        mysqlven.query("UPDATE users SET pwd=? WHERE emailid=? and pwd=?",[NewPwd,emailid,pwd],function(err,allRecords)
        {
                    if(allRecords.affectedRows==1)
                    {
                        resp.send("Password Updated Successfully");
                    }
                    else
                        console.log(err);
                    
        })
})

app.get("/do-Change-Pwd-index",function(req,resp)
{   let emailid=req.query.Email;
   
    let NewPwd=req.query.NewPwd;
    
        mysqlven.query("UPDATE users SET pwd=? WHERE emailid=?",[NewPwd,emailid],function(err,allRecords)
        {
                    if(allRecords.affectedRows==1)
                    {
                        resp.send("Password Updated Successfully");
                    }
                    
        })
})

// if(req.query.kuchCity=='All'&& req.query.kuchGame=='All')
    // {console.log(req.query)
    //     mysqlven.query("select * from tournaments ",[],function(err,allRecords)
    //     {
    //       console.log(allRecords)
    //                 resp.send(allRecords);
    //     })
    // }
    
    // if(req.query.kuchCity=='All'&& req.query.kuchGame!='All' && req.query.kuchGame!='undefined')
    // {console.log(req.query)
    //     mysqlven.query("select * from tournaments where sports=?",[req.query.kuchGame],function(err,allRecords)
    //     {
    //       console.log(allRecords)
    //                 resp.send(allRecords);
    //     })
    // }
    // if(req.query.kuchGame=='All'&& req.query.kuchCity!='All' && req.query.kuchCity!='null')
    // {console.log(req.query)
    //     mysqlven.query("select * from tournaments where city=?",[req.query.kuchCity],function(err,allRecords)
    //     {
    //       console.log(allRecords)
    //                 resp.send(allRecords);
    //     })
    // }
    
    