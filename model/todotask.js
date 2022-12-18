const mongoose=require("mongoose");

const todoTaskSchema=new mongoose.Schema({
    todoUser:{
        type:String,
        required:true
    },
    todoTaskList:[
        {
            taskTitle:{
                type:String,
                required:true
            },
            task:{
                type:String,
                required:true
            },
            taskTime:{
                type:String,
                required:true
            }
        }
    ]
})

todoTaskSchema.methods.updateTaskList=async function(taskTitle,task,taskTiem){
    try{
        // console.log(this._id);
        this.todoTaskList=this.todoTaskList.concat({taskTitle:taskTitle,task:task,taskTime:taskTiem})
        await this.save();
    }catch(error){
        console.log("thiere is an error to update tasklist");
    }
}



const todoModal=new mongoose.model("todoTask",todoTaskSchema);

module.exports=todoModal;