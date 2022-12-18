require("dotenv").config();
const express=require("express");
const path=require("path");
const hbs=require("hbs");
const nodemailer = require("nodemailer");
require("./db/conn");
const ToDoUserModule=require("./model/todouser");
const bcrypt=require("bcryptjs");
const cookieParser=require("cookie-parser");
const auth=require("./middleware/auth");
const ToDoTaskModule=require("./model/todotask");


hbs.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
})

//smtp setup for sending mail
const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
    }
});

//function for hashing user password
const createHashing=async (password)=>{
    const pass=await bcrypt.hash(password,10);
    return pass;
}

const port=process.env.PORT || 8000;
const app=express();

const staticPath=path.join(__dirname,"/public");
const partialPath=path.join(__dirname,"/templates/partials");
const viewPath=path.join(__dirname,"/templates/views");


app.use(express.static(staticPath));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());


app.set("view engine","hbs");
app.set("views",viewPath);

hbs.registerPartials(partialPath);

app.get("/",(req,res)=>{
    let Cke=false;
    if(req.cookies.jwt){
        Cke=req.cookies.jwt;
    }
    res.render("home",{isVisible:false,istoastErr:false,Cookie:Cke});
})

app.get("/operate",(req,res)=>{
    let Cke=false;
    if(req.cookies.jwt){
        Cke=req.cookies.jwt;
    }
    res.render("operate",{Cookie:Cke})
})

app.get("/todouser",auth,(req,res)=>{
    const umail=req.user.userMail;
    res.render("todoUser",{userMail:umail,login:true});
})

app.get("/tasks",auth,async (req,res)=>{
    const user=await ToDoTaskModule.findOne({todoUser:req.user.userMail});
    // console.log(user.todoTaskList);
    if(user){
    res.render("tasks",{login:true,todoData:user.todoTaskList});}
    else{
        res.render("tasks",{login:true});
    }
})

app.get("/findtask/:id",auth,async (req,res)=>{
    taskId=req.params.id;
    userMail=req.user.userMail;
    const task=await ToDoTaskModule.findOne({todoUser:userMail});
    const taskList=task.todoTaskList;
    let obj="";
    taskList.forEach((item)=>{
        // console.log(item._id+" "+taskId);
        if(item._id+""+taskId === taskId+""+item._id){
            obj=item;
        }
    })
    // return JSON.stringify(obj);
    res.send(obj);
})

app.post("/taskupdate/:id",auth,async (req,res)=>{
    taskId=req.body.tid;
    userMail=req.user.userMail;
    taskTTL=req.body.ttitle;
    taskt=req.body.task;
    taskTimeT=req.body.ttime;
    await ToDoTaskModule.updateOne(
        {
            todoUser:userMail ,
            todoTaskList: { $elemMatch: { _id: taskId} }
        },
        { $set: { "todoTaskList.$.taskTitle" : taskTTL,"todoTaskList.$.task": taskt, "todoTaskList.$.taskTime": taskTimeT } }
     )
    //  console.log("hi");
     res.redirect("/tasks")
})

app.post("/taskdelete",auth,async (req,res)=>{
    taskId=req.body.tid;
    userMail=req.user.userMail;
    const deleted=await ToDoTaskModule.updateOne({
        todoUser: userMail
      }, {
        $pull: {
          todoTaskList: {
            _id: taskId
          }
        }
      }
      );
      res.redirect("/tasks");
})



app.post("/register",async (req,res)=>{
    //check password and confirm password
    if(req.body.upass=="" || req.body.upass !== req.body.ucpass){
        res.render("home",{isVisible:false, istoastErr:true,headerMsg:"Validation Error",toastMsg:"Please fill all fields Properly",login:false})
    }

    //find usermail already exist in our database or not
    let data=await ToDoUserModule.findOne({userMail:req.body.umail});

    //if user exist then show a popup.
    if(data){
        res.render("home",{isVisible:false, istoastErr:true,headerMsg:"User Found",toastMsg:"User already exist please login",login:false});
    }

    //if user not exist
    else{
    //create a 6 digit veirfication code
    const randNumber=Math.floor(Math.random() * (999999 - 100000) + 100000);

    //marge all data into an object.
    const obj={
        uname:req.body.uname,
        umail:req.body.umail,
        upass:req.body.upass,
        urandomNum:randNumber
    }
    
    //send 6 digits code to user
    const mailOp={
        from:req.body.umail, 
        to:req.body.umail,
        subject:`Authen ToDo`,
        html:`<div><h2>Here is your secure code </h2><h4>${randNumber}</h4> </div>`
    }
    transporter.sendMail(mailOp,function(error,info){
        if(error){
            console.log(error)
        }
        else{
            console.log('email send successfuly'+info.response);
        }
    })

    //render home page with  userObject
    res.render("home",{request:req,isVisible:true,userobject:obj});}
})

app.post("/cregister",async (req,res)=>{

    //create user provide 6 digit code
    let userPutSer=req.body.c1+req.body.c2+req.body.c3+req.body.c4+req.body.c5+req.body.c6;

    //check user provided 6 digit code with our real provided code
    if(userPutSer != "" && userPutSer === req.body.randNum){

        //if all are ok then save user data into database.
        const userData=new ToDoUserModule({
            userName:req.body.uname,
            userMail:req.body.umail,
            userPassword:await createHashing(req.body.upass),
            tokens:[]
        })

        let udata=await userData.save();
        console.log(udata);
    }
    res.redirect("/");
})

app.post("/login",async (req,res)=>{
    try{
        let usermail=req.body.umail;
        let userpassword=req.body.upass;
        let udata=await ToDoUserModule.findOne({userMail:usermail});
        
        if(udata){
            let checkPassword=await bcrypt.compare(userpassword,udata.userPassword);
            if(checkPassword){
            const token=await udata.generateAuthToken();
            // console.log(token);
            if(token == false){
                res.render("home",{isVisible:false, istoastErr:true,headerMsg:"User already logedin",toastMsg:"User already logedin in another device",login:false});
            }
            // console.log(token);
            else{
            let hour = 3600000;
            let weeks= 14 * 24 * hour;
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+weeks),
                httpOnly:true
            })

            res.redirect(`todouser`);
        }
        }
        else{
            res.render("home",{isVisible:false, istoastErr:true,headerMsg:"User Not Found",toastMsg:"Please Make sure your registration !!",login:false});
        }
        }
        else{
            res.render("home",{isVisible:false, istoastErr:true,headerMsg:"User Not Found",toastMsg:"Please Make sure your registration !!",login:false});
        }
    }catch(err){
        console.log(err);
        res.redirect("/");
    }
})

app.get("/logout",auth,async(req,res) =>{
    try{
        // console.log(req.user);

        // logout for all devices
        req.user.tokens=[];

        res.clearCookie("jwt");

        await req.user.save();
        res.render("home",{isVisible:false,istoastErr:false});
    }catch(error){
        res.status(400).send(error);
    }
})

app.post("/addtask",auth,async (req,res)=>{
    const taskTitle=req.body.ttitle;
    const task=req.body.task;
    const taskTime=req.body.ttime;
    const user=req.user.userMail;
    const existUser=await ToDoTaskModule.findOne({todoUser:user});
    if(!existUser){
        const objectArr=[
            {
                taskTitle:taskTitle,
                task:task,
                taskTime:taskTime
            }
        ]

        const allTaskData=new ToDoTaskModule({
            todoUser:user,
            todoTaskList:objectArr
        })

        const result=await allTaskData.save();
    }
    else{
        existUser.updateTaskList(taskTitle,task,taskTime);

    }
    res.redirect("/todouser");
})

app.listen(port,(err)=>{
    if(!err){
        console.log(`listening to port ${port}`)
    }
    else{
        console.log(err);
    }
})