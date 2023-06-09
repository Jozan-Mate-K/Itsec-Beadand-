function GetPosts(){
    const contentContainer = document.getElementById("contentContainer");
    contentContainer.scrollTo(0, 0);
    document.getElementById("revealContainer").innerHTML = "";
    setTimeout(() => {
        ShowPosts(); 
    }, 300);
 
}
async function ShowPosts(){
    try{
        let res = await fetch(backendIp + "/getPosts",{
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "username": localStorage.getItem('name'),
                "token": localStorage.getItem('token'),
            })
        });
        let content = await res.json();
        if(content.length == 0){
            NoPostsToShow();
        }else if(content['data'] == 'fail'){
            console.error("Couldn't fetch posts");
        }else{
            content.forEach(element => {
                ShowNextPost(element.user, element.date , element.title, element.id);
            });
        }
    }catch(e){
        console.error(e);
    }
}

function GetPostsOfUser(){
    const contentContainer = document.getElementById("contentContainer");
    contentContainer.scrollTo(0, 0);
    document.getElementById("revealContainer").innerHTML = ""; 
    setTimeout(() => {
        ShowPostsOfUser();
    }, 300);
}
async function ShowPostsOfUser(){
    try{
        let res = await fetch(backendIp + "/getPostsOfUser",{
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "username": localStorage.getItem('name'),
                "user": localStorage.getItem('name'),
                "token": localStorage.getItem('token'),
            })
        });
        let content = await res.json();
        if(content.length == 0){
            NoPostsToShow();
        }else if(content['data'] == 'fail'){
            console.error("Couldn't fetch posts");
        }else{
            content.forEach(element => {
                ShowNextPostOfUser(element.user, element.date , element.title, element.id);
            });
        }
    }catch(e){
        console.error(e);
    }
}


function NoPostsToShow(){
    document.getElementById("revealContainer").innerHTML = '<p>Sorry! There are no posts to show at this time</p>';
}

function ShowNextPost(user,date,title,id){
    document.getElementById("revealContainer").innerHTML += '<div id="head'+id+'" onclick="ShowContents('+ id +')" class="reveal forumButton"><div><h1>' + user + '</h1><p style="border: 0; font-style: italic;">' + date + '</p></div><p>'+ title + '</p></div><div id="'+ id +'" class="reveal commentContainer"></div>';
}
function ShowNextPostOfUser(user,date,title,id){
    document.getElementById("revealContainer").innerHTML += '<div id="head'+id+'" onclick="ShowContents('+ id +')" class="reveal forumButton"><div><h1>' + user + '</h1><p style="border: 0; font-style: italic;">' + date + '</p></div><p>'+ title + '</p></div><button class="reveal deleteButton" onclick="DeletePost('+id+');" >Delete</button><div id="'+ id +'" class="reveal commentContainer"></div>';
}

function Post(){
    let responseField = document.getElementById("response");

    let title = document.getElementById("postTitle").value;
    let post = document.getElementById("post").value;
    title = title.replace(/'/g,"\\'");
    post = post.replace(/'/g,"\\'");
    title = title.replace(/"/g,'\\"');
    post = post.replace(/"/g,'\\"');


    if(title == ""){
        responseField.innerHTML = "There is no title";
        return;
    }
    if(post == ""){
        responseField.innerHTML = "There is no body";
        return;
    }



    let date, month, year, sendDate;
    let inputDate = new Date();

    date = inputDate.getDate();
    month = inputDate.getMonth() + 1;
    year = inputDate.getFullYear();

    if (date < 10) {
        date = '0' + date;
    }
    
    if (month < 10) {
        month = '0' + month;
    }
    sendDate = year + "-" + month + "-" + date;
    SendPost(sendDate, title, post);
}
async function SendPost(sendDate, title, post){
    let responseField = document.getElementById("response");

    try{
        let res = await fetch(backendIp + "/post", {
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "username": localStorage.getItem('name'),
                "token": localStorage.getItem('token'),
                "postDate": sendDate,
                "title": title,
                "contents": post,
            })
        });

        let data = await res.json();
        content = data['data'];
    }catch(e){
        console.error(e);
    }finally{
        if(content != "error"){
            ShowPostPanel();
            GetPosts();
            document.getElementById("postTitle").value = "";
            document.getElementById("post").value = "";
        }else{
            responseField.innerHTML = "Server error, please try again";
        }

    }
}
async function DeletePost(id){
    try{
        let res = await fetch(backendIp + "/deletePost",{
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "postId":id,
                "token": localStorage.getItem('token'),
                "username": localStorage.getItem('name'),
                "user": localStorage.getItem('name')
            })
        }); 
    }catch(e){
        console.error(e)
    }
    load('./Account.html', 'Account'); 
    GetPostsOfUser(); 
}
function ShowContents(id){
    let commentWindow = document.getElementById(id);
    let head = document.getElementById("head"+id);
    if(!commentWindow.classList.contains("show")){
        head.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        setTimeout(async function(){
            commentWindow.classList.add("show");
            let content = await LoadContents(id);
            commentWindow.innerHTML = "<p style='word-wrap: break-word'>" + content + "</p>";
        }, 100)
    }else{
        commentWindow.innerHTML = "";
        commentWindow.classList.remove("show");
    }
}
async function LoadContents(id){
    let content;
    try{
        let res = await fetch(backendIp + "/postContents", {
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "id": id,
            })
        });
        let data = await res.json();
        content = data['data'];
    }catch(e){
        console.error(e);
    }
    return content;
}

function ShowPostPanel(){
    let postTextContainer = document.getElementById("postTextContainer");
    let sendPostButton = document.getElementById("sendPostButton")
    if(postTextContainer.classList.contains("show")){
        postTextContainer.classList.remove("show");
    }else{
        postTextContainer.classList.add("show");
    }
    if(sendPostButton.classList.contains("show")){
        sendPostButton.classList.remove("show");
    }else{
        sendPostButton.classList.add("show");
    }
}