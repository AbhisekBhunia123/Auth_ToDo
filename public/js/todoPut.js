
const setData=(e)=>{
  let taskfield=document.getElementById("Task_ID");
  let taskTF=document.getElementById("Task_title");
  let taskF=document.getElementById("Task");
  let taskTimeF=document.getElementById("Task_time");
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    const obj = this.responseText;
    const parseObj=JSON.parse(obj);
    taskfield.value=parseObj._id;
    taskTF.value=parseObj.taskTitle;
    taskF.value=parseObj.task;
    taskTimeF.value=parseObj.taskTime;
    }
  xhttp.open("GET", `http://localhost:8000/findtask/${e.target.name}`, true);
  xhttp.send();
}

const delData=(e)=>{
  let taskId=document.getElementById("task_ID");
  taskId.value=e.target.name;
}

const deleteTask=(e)=>{
    const xhttp = new XMLHttpRequest();
    const objectId=e.target.name;
    xhttp.onload = function() {
      console.log("Hello");
      }
    xhttp.open("POST", `http://localhost:8000/taskdelete/${objectId}`, true);
    xhttp.send();
}

$(document).ready(function(){
  $(".taskBtn").on("mouseenter",function(e){
      var parentOffset=$(this).offset(),
      relX=e.pageX-parentOffset.left,
      relY=e.pageY-parentOffset.top
      $(this).find("span").css({
          top:relY,
          left:relX
      })
  })
  .on("mouseout",function(e){
      var parentOffset=$(this).offset(),
      relX=e.pageX-parentOffset.left,
      relY=e.pageY-parentOffset.top
      $(this).find("span").css({
          top:relY,
          left:relX
      })
  })
})