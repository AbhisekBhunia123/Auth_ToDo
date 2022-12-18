const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");


const ToDoUserSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
    },
    userMail:{
        type:String,
        required:true
    },
    userPassword:{
        type:String,
        required:true
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

//generate tokens
ToDoUserSchema.methods.generateAuthToken=async function(){
    try{
        // console.log(this._id);
        const token=jwt.sign({_id:JSON.stringify(this._id)},process.env.SECRET_KEY);
        if(this.tokens.length == 1){
            return false;
        }
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(error){
        console.log("thiere is an error to create a token");
    }
}


const ToDoUserModule=new mongoose.model("ToDoUser",ToDoUserSchema);
module.exports=ToDoUserModule;