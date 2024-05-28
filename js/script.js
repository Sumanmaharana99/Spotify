let currentsong = new Audio();
let songs;
let volume;
let currFolder;
let indexOfsong;
function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML="";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="assets/music.svg" alt="music">
        <div class="songinfo">
            <div>${song.replaceAll("%20", " ")}</div>
            <div></div>
        </div>
        <div class="playNow">
            <span>Play now</span>
            <img id="playnow" class="invert" src="assets/play.svg" alt="play">
        </div>   
    </li>`;
    }
    //Attach an event listener to each song..
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
        })
      
    })
return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "assets/pause.svg";

    }
    document.querySelector(".songName").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

}
async function displayAlbums(){
    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a");
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
    for(let i=0;i<array.length;i++){
        const e=array[i];

        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0];
            console.log(folder)
            //Get the metadata of the folder
            let a = await fetch(`/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder=${folder} class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26"
                    color="#000000" fill="#000">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" stroke-width="1" stroke-linejoin="bevel" />
                </svg>
            </div>
           

            <img src="/songs/${folder}/cover.jpg" alt="">
            </contains>
            <h2 style="font-weight: 500;">${response.title}</h2>
            <p class="fontStyle" style="font-size:10px;">${response.Description}</p>
        </div>`
        }
    }
  //Load the playlist whenever the card is clicked..
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        // console.log(e);
        // console.log(item.currentTarget, item.currentTarget.dataset)
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    playMusic(songs[0]);
    }
    )
})
}



async function main() {
    //GET the list of all the songs..
    await getSongs("songs/Animal");
    playMusic(songs[0], true)
    // console.log(songs);
   
    //Display all the albums on the page..
    displayAlbums();

    //Attach an event listener to play,next and previous..
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "assets/pause.svg"
            playnow.src="assets/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "assets/playSong.svg"
            
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentsong.currentTime)} / ${secondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";//seekbar circle moving with time
    })
    //Add a event listener to the seekbar..
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    })


   


    //Add eventlistener to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left-section").style.left = "0";
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left-section").style.left = "-120%";
    })
    //Add eventListener to prev and next
    prev.addEventListener("click", () => {
        console.log("Prev clicked...")
        //split("/")->splits parts by / symbol
        //slice(-1)->negative indexing concept
       indexOfsong = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (( indexOfsong - 1) >= 0) {
            playMusic(songs[ indexOfsong - 1]);
        }
        return indexOfsong;
    })
    next.addEventListener("click", () => {
        // console.log("Next clicked..")
        // console.log(currentsong.src.split("/"))
        // console.log(currentsong.src.split("/").slice(-1)[0])
        // console.log("Index:",songs.indexOf(currentsong.src.split("/").slice(-1)[0]))

        indexOfsong = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (( indexOfsong + 1) < songs.length) {
            playMusic(songs[ indexOfsong + 1]);
        }
        return indexOfsong;
    })
    //Add a event listener to volume
    let range = document.querySelector(".range");
    range.getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("Setting volume to: ", e.target.value);
        volume = parseInt(e.target.value) / 100;
        currentsong.volume = volume;
        if (volume > 0) {
            document.querySelector("#volume").src = "assets/volume.svg";
        }
        else {
            document.querySelector("#volume").src = "assets/mute.svg";
        }
    })


   // Add event listener to mute the track
   document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("assets/volume.svg")){
        e.target.src = e.target.src.replace("assets/volume.svg", "assets/mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("assets/mute.svg", "assets/volume.svg")
        currentsong.volume = .30;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
    }

})

}
main();
