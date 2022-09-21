
var settingsMenu = document.querySelector(".settings-menu");


function settingsMenuToggle(){
    settingsMenu.classList.toggle("settings-menu-height");
}

const button = document.getElementById('follow');
button.addEventListener('click', function(e) {
    console.log('button was clicked');

    fetch('/follow', {method: "PUT"})
    .then(function(response) {
        if(response.ok) {
            console.log('click was recorded');
            return;
        }
        //throw new Error('Request failed.');
    })
    .catch(function(error) {
        console.log(error);
    });
});

// -----------dark mode button------------

var darkBtn = document.getElementById("dark-btn");

darkBtn.onclick = function(){
    darkBtn.classList.toggle('dark-btn-on');
    document.body.classList.toggle("dark-theme");

    if(localStorage.getItem("theme") == "light"){
        localStorage.setItem("theme", "dark");
    }else{
        localStorage.setItem("theme", "light");
    }
    
}

if(localStorage.getItem("theme") == "light"){

    darkBtn.classList.remove('dark-btn-on');
    document.body.classList.remove("dark-theme");
}
else if(localStorage.getItem("theme") == "dark"){

    darkBtn.classList.add('dark-btn-on');
    document.body.classList.add("dark-theme");
}
else{
    localStorage.setItem("theme", "light");
}
