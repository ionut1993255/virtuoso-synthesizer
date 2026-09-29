// DOM ELEMENTS
const pianoKeys = document.querySelectorAll(".piano-keys .key");
const volumeSlider = document.querySelector(".volume-slider input");
const keysCheckbox = document.querySelector(".keys-checkbox input");
const instrumentSelector = document.querySelector(".instrument-selector");
const displaySongs = document.querySelector(".show-song-list");
const songList = document.querySelector(".song-list");
const btnRecord = document.querySelector(".btn-record");
const btnStopRecord = document.querySelector(".btn-stop-record");
const form = document.querySelector("form");
const input = form.querySelector('input[type="text"]');
const overlay = document.querySelector(".overlay");
const btnSave = document.querySelector(".btn-save");
const btnCancel = document.querySelector(".btn-cancel");
const songUList = document.querySelector(".song-list ul");

// STATE
let defaultPath = "/tunes/acoustic_grand_piano/"; // Default instrument is "Acoustic Piano"
let audio = new Audio(defaultPath);
let allKeys = [];
let startTime = 0;
let elapsedTime = 0;
let intervalId;
let notesPlayed = [];
let pbStartTime = 0;
let pbElapsedTime = 0;
let pbIntervalId;

// API
const API_URL = "http://127.0.0.1:8000/api";

// RECORDING CHRONOMETER
const startChronometer = () => {
  startTime = new Date().getTime();
  intervalId = setInterval(updateElapsedTime, 100);
};

const stopChronometer = () => {
  clearInterval(intervalId);
};

const updateElapsedTime = () => {
  // Elapsed time since the chronometer started, in 100 ms units
  const currentTime = new Date().getTime();
  elapsedTime = Math.floor((currentTime - startTime) / 100);
};

// PIANO
const playTune = (key) => {
  audio.src = defaultPath + `${key}.wav`; // Set the audio source based on the pressed note
  audio.play().catch((error) => {
    console.error(`Unable to play note: ${key}`, error);
  });

  if (btnRecord.classList.contains("record")) {
    notesPlayed.push({
      instrument: instrumentSelector.value,
      note: key,
      time: elapsedTime,
    });
  }

  const clickedKey = document.querySelector(`[data-key="${key}"]`); // Select the pressed key
  clickedKey.classList.add("active");
  setTimeout(() => {
    clickedKey.classList.remove("active");
  }, 150);
};

pianoKeys.forEach((key) => {
  allKeys.push(key.dataset.key); // Add the note value from the dataset to "allKeys"
  key.addEventListener("click", () => playTune(key.dataset.key));
});

const pressedKey = (e) => {
  // If the pressed note is included in "allKeys", call "playTune"
  if (allKeys.includes(e.key)) playTune(e.key);
};

// VOLUME AND INSTRUMENT
const handleVolume = (e) => {
  audio.volume = e.target.value;
};

const chosenInstrument = (e) => {
  defaultPath = "/tunes/" + e.target.value + "/";
};

const changeInstrument = (newInstrument) => {
  defaultPath = "/tunes/" + newInstrument + "/";
};

// SHOW/HIDE KEYS
const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

// SONGS API
const getSongs = async () => {
  const existingMessage = document.querySelector(".song-list-message");
  if (existingMessage) existingMessage.remove();

  try {
    const response = await fetch(`${API_URL}/songs`);

    if (!response.ok) {
      throw new Error("Unable to fetch songs!");
    }

    const data = await response.json();
    buildSongList(data);
  } catch {
    showSongListMessage("Unable to load songs!");
  }
};

const saveNotes = async () => {
  // Do not send a request if no notes were recorded
  if (notesPlayed.length === 0) {
    return;
  }

  const response = await fetch(`${API_URL}/notes`, {
    method: "POST",
    body: JSON.stringify(notesPlayed),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
};

const sendCreateSongRequest = async (name, length) => {
  try {
    const response = await fetch(`${API_URL}/songs`, {
      method: "POST",
      body: JSON.stringify({
        name,
        length,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Unable to create song!");
    }

    await response.json();
    await saveNotes(); // Attach notes to the latest created song
    songList.classList.add("active");
    await getSongs();
    resetValues();
  } catch (error) {
    console.error("Unable to save song!", error);
  }
};

const deleteSong = async (songId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this song?",
  );

  if (!confirmed) {
    return;
  }

  resetValues();
  pbStopChronometer();

  try {
    const response = await fetch(`${API_URL}/songs/${songId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    await getSongs();
  } catch (error) {
    console.error("Unable to delete song!", error);
  }
};

// SONG LIST
const showSongListMessage = (message) => {
  const messageElement = document.createElement("p");
  messageElement.classList.add("song-list-message");
  messageElement.textContent = message;
  songList.appendChild(messageElement);
};

const buildSongList = (data) => {
  songUList.innerHTML = "";

  if (data.length === 0) {
    showSongListMessage("No songs available!");
    return;
  }

  data.forEach((song, index) => {
    songUList.appendChild(
      buildSongItem(song["id"], index + 1, song["name"], song["length"]),
    );
  });
};

const buildSongItem = (id, index, name, length) => {
  const child = document.createElement("li");
  child.classList.add("song");

  // "length / 10" converts the length from 100 ms units to seconds
  const songTitle = document.createElement("span");
  songTitle.classList.add("song-title");
  songTitle.textContent = `${index}. ${name}: ${length / 10}s`;

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("btns-song");
  buttonsContainer.innerHTML = `
    <button class="btn-play">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        stroke="rgb(63, 183, 63)"
        stroke-width="1.5"
        width="0.8rem"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
        />
      </svg>
    </button>

    <button class="btn-stop">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        stroke="red"
        stroke-width="1.5"
        width="0.8rem"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
        />
      </svg>
    </button>

    <button class="btn-remove">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="red"
        stroke-width="1.5"
        width="0.8rem"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </button>
  `;

  const playButton = buttonsContainer.querySelector(".btn-play");
  const stopButton = buttonsContainer.querySelector(".btn-stop");
  const removeButton = buttonsContainer.querySelector(".btn-remove");

  playButton.addEventListener("click", () => playback(id));
  stopButton.addEventListener("click", pbStopChronometer);
  removeButton.addEventListener("click", () => deleteSong(id));

  child.append(songTitle, buttonsContainer);
  return child;
};

const displaySong = () => {
  songList.classList.toggle("active");
  getSongs();
};

// PLAYBACK
const pbStartChronometer = (data) => {
  pbStartTime = new Date().getTime();
  pbIntervalId = setInterval(() => pbUpdateElapsedTime(data), 100);
};

const pbStopChronometer = () => {
  clearInterval(pbIntervalId);
  btnRecord.disabled = false;
};

const pbUpdateElapsedTime = (data) => {
  const currentTime = new Date().getTime();

  // "pbElapsedTime" is measured in 100 ms units
  pbElapsedTime = Math.floor((currentTime - pbStartTime) / 100);

  data.forEach((noteObject) => {
    if (noteObject.time === pbElapsedTime) {
      instrumentSelector.value = noteObject.instrument;
      changeInstrument(noteObject.instrument);
      playTune(noteObject.note);
    }
  });
};

const playback = async (songId) => {
  pbStopChronometer();
  btnRecord.disabled = true;

  try {
    const response = await fetch(`${API_URL}/notes/${songId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    const data = await response.json();
    playSong(data);
  } catch (error) {
    console.error("Unable to play song!", error);
    btnRecord.disabled = false;
  }
};

const playSong = (data) => {
  resetValues();
  pbStartChronometer(data);

  const songLength = Math.max(...data.map((note) => note.time));

  setTimeout(() => {
    pbStopChronometer();
    btnRecord.disabled = false;
  }, songLength * 100); // Convert 100 ms units to milliseconds
};

// RECORDING
const record = () => {
  btnRecord.classList.add("record");
  btnRecord.disabled = true;
  btnStopRecord.disabled = false;
  startChronometer();
};

const stopRecord = () => {
  btnRecord.classList.remove("record");
  btnRecord.disabled = false;
  btnStopRecord.disabled = true;
  stopChronometer();
};

// POPUP
const showForm = () => {
  form.classList.add("active");
  overlay.classList.add("active");
  document.removeEventListener("keydown", pressedKey);
};

const saveSong = (e) => {
  e.preventDefault(); // Prevent the browser's default behavior

  if (input.value.trim() === "") {
    alert("Please name your song!");
    return false;
  }

  sendCreateSongRequest(input.value.trim(), elapsedTime);
  closePopup();
};

const cancelSong = (e) => {
  e.preventDefault(); // Prevent the browser's default behavior
  closePopup();
  resetValues();
};

const resetValues = () => {
  input.value = "";
  elapsedTime = 0;
  notesPlayed = [];
};

const closePopup = () => {
  form.classList.remove("active");
  overlay.classList.remove("active");
  document.addEventListener("keydown", pressedKey);
};

// EVENT LISTENERS
keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);
instrumentSelector.addEventListener("change", chosenInstrument);
displaySongs.addEventListener("click", displaySong);
btnRecord.addEventListener("click", record);
btnStopRecord.addEventListener("click", stopRecord);
btnStopRecord.addEventListener("click", showForm);
btnSave.addEventListener("click", saveSong);
btnCancel.addEventListener("click", cancelSong);
