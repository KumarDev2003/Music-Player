console.log('This is java script');

let currentSong = new Audio();

let songs;

let currFolder;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60); // Get the minutes part
    const secs = Math.floor(seconds % 60); // Get the seconds part
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`; // Format as minutes:seconds
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    // Set the source of the current song
    currentSong.src = `/${currFolder}/` + track;

    // Display the song name and reset the time display
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = `00:00 / 00:00`;

    // Play or pause the song
    if (!pause) {
        currentSong.play();
        playbarBtn.src = "/svgs/pause.svg"; // Update the play button icon
    } else {
        currentSong.pause();
    }
};


async function main() {
    // Fetch and display the initial songs from the "Electronic" folder
    let songs = await getSongs("songs/Electronic");
    console.log(songs);

    // Play the first song in the list and set it to autoplay
    playMusic(songs[0], true);

    // Populate the song list UI with the fetched songs
    populateSongList(songs);

    // Attach click listeners to the song cards
    attachCardClickListeners();
}


// Function to attach event listeners to the cards
function attachCardClickListeners() {
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.getAttribute("data-folder");
            let songs = await getSongs(`songs/${folder}`);
            console.log(`Songs from folder ${folder}:`, songs);

            // Clear the current list and populate with new songs
            populateSongList(songs);
        });
    });
}

// Function to populate the song list with new songs
function populateSongList(songs) {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    
    // Clear the existing list
    songUL.innerHTML = "";

    // Add new songs
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img id="music" src="svgs/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                </div>
                <div class="sideBarPlayBtn">
                    <img src="svgs/playButton.svg" alt="">
                </div>
            </li>`;
    }

    // Reattach listeners for the new list items
    attachSongClickListeners();
}

// Function to attach click listeners to songs in the list
function attachSongClickListeners() {
    let listItems = document.querySelectorAll(".songList li");
    
    listItems.forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML;
            console.log("Playing:", songName);
            playMusic(songName);
        });
    });
}
 
playbarBtn.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play();
        playbarBtn.src = "/svgs/pause.svg";
    }else{
        currentSong.pause();
        playbarBtn.src = "/svgs/playBarButton.svg";
    }
})

currentSong.addEventListener("timeupdate", () => {
    const currentTime = formatTime(currentSong.currentTime); // Format current playback time
    const duration = formatTime(currentSong.duration || 1); // Avoid division by zero, default to 1
    
    // Update the time display
    document.querySelector(".songTime").innerHTML = `${currentTime}/${duration}`;
    
    // Update the progress bar (circle)
    if (currentSong.duration > 0) { // Ensure duration is valid
        const progress = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = `${progress}%`;
    } else {
        document.querySelector(".circle").style.left = "0%"; // Reset to start if no valid duration
    }
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
    const seekbar = e.target; // The seekbar element
    const seekbarWidth = seekbar.getBoundingClientRect().width; // Get the seekbar width
    const clickPosition = e.offsetX; // Get the click position relative to the seekbar

    // Calculate the new playback time based on the click position
    const newTime = (clickPosition / seekbarWidth) * currentSong.duration;

    // Update the audio's current time
    currentSong.currentTime = newTime;

    // Update the circle's position
    const progress = (newTime / currentSong.duration) * 100;
    document.querySelector(".circle").style.left = `${progress}%`;
});


document.querySelector("#hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
    document.querySelector(".right").style.right = "100%"
})

document.querySelector("#crossBtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%"
    document.querySelector(".right").style.right = "0"
})

backwardBtn.addEventListener("click", () => {
    console.log("Backward btn clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    let prevIndex = (index - 1 + songs.length) % songs.length;
    playMusic(songs[prevIndex]);
})

fowardBtn.addEventListener("click", () => {
    console.log("Forward btn clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    let nextIndex = (index + 1) % songs.length;
    playMusic(songs[nextIndex])
})

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value)/100;
})


// Data for the cards
const folders = [
    {
        folder: "Electronic",
        image: "Images/electronic.jpg",
        title: "Electronic",
        description: "Electrify your vibe with the best electronic hits"
    },
    {
        folder: "Chill",
        image: "Images/chill.jpg",
        title: "Chill",
        description: "Relax and unwind with these chill beats"
    },
    {
        folder: "Dubstep",
        image: "Images/dubstep.jpg",
        title: "Dubstep",
        description: "Feel the energy with hard-hitting dubstep tracks"
    },
    {
        folder: "FutureBass",
        image: "Images/future-bass.jpg",
        title: "Future Bass",
        description: "Immerse yourself in melodic and energetic future bass"
    },
    {
        folder: "Pop",
        image: "Images/pop.jpg",
        title: "Pop",
        description: "Enjoy the catchy tunes and feel-good pop music"
    }    
];

// Function to load cards dynamically
function loadCards() {
    const cardContainer = document.querySelector(".cardContainer");

    // Clear the container (if needed)
    cardContainer.innerHTML = "";

    // Generate and append cards
    folders.forEach(folder => {
        cardContainer.innerHTML += `
            <div data-folder="${folder.folder}" class="card">
                <div class="play">
                    <img id="play" src="svgs/playButton.svg" alt="">
                </div>
                <img src="${folder.image}" alt="">
                <h2>${folder.title}</h2>
                <p>${folder.description}</p>
            </div>`;
    });

    // Attach listeners to the dynamically created cards
    attachCardClickListeners();
}

// Call the function to load cards
loadCards();

// Handle mute/unmute via volume button
document.querySelector(".volume").addEventListener("click", e => {
    const target = e.target;

    // Extract just the filename from the `src` attribute
    const currentSrc = target.src.split("/").pop();

    const volumeSlider = document.querySelector(".range").getElementsByTagName("input")[0];

    if (currentSrc === "volume.svg") {
        target.src = "svgs/mute.svg"; // Switch to mute
        currentSong.volume = 0;
        volumeSlider.value = 0; // Update slider position to reflect mute
    } else {
        target.src = "svgs/volume.svg"; // Switch to volume
        currentSong.volume = 20 / 100; // Set default volume to 20% (0.2)
        volumeSlider.value = 20; // Update slider position to reflect unmute
    }
});

main();
