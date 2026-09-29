# Virtuoso Synthesizer

A web-based synthesizer built with **HTML**, **CSS**, and **JavaScript**.

It includes recording and song management functionality through **Virtuoso API**.

---

## Project Structure

```text
virtuoso-synthesizer/
├── tunes/
├── index.html
├── README.md
├── script.js
├── style.css
└── virtuoso-synthesizer.ico
```

The `tunes/` directory contains the instrument audio files.

---

## Technologies Used

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Fetch API**

---

## Key Features

- Virtual synthesizer keyboard
- Mouse and keyboard controls
- Multiple instrument selection
- Volume control
- Show/hide keyboard keys
- Song recording
- Recording chronometer
- Saving recorded songs
- Saved song list
- Song playback
- Playback chronometer
- Instrument changes during playback
- Stop playback
- Song deletion
- API error handling

---

## Getting Started

Use **Live Server** to launch the frontend application.

It will be available at:

```text
http://127.0.0.1:5500
```

**Virtuoso API** must also be running at:

```text
http://127.0.0.1:8000/api
```

---

## Recording

Users can record a sequence of notes.

For example, each note contains:

```json
{
  "instrument": "acoustic_grand_piano",
  "note": "a",
  "time": 10
}
```

The `time` value represents the elapsed time in **100 ms units**.

After recording stops, users can enter a song name and save it.

---

## Song List

The list can be toggled by pressing a button.

Each song displays its index, name and duration, with options to play, stop, or delete it.

If no songs are available, the application displays:

```text
No songs available!
```

If the API cannot be reached, it displays:

```text
Unable to load songs!
```

---

## Playback

When a saved song is played, the application retrieves its recorded notes from the API.

Notes are played according to their recorded timestamps using a separate playback chronometer.

The instrument is changed according to the instrument stored with each note.

Recording is disabled while a song is playing.

---

## API Integration

The frontend communicates with **Virtuoso API** using **Fetch API**.

```javascript
const API_URL = "http://127.0.0.1:8000/api";
```

The application uses the following endpoints:

| Method   | Endpoint           | Description          |
| -------- | ------------------ | -------------------- |
| `GET`    | `/songs`           | Get all songs        |
| `POST`   | `/songs`           | Create a song        |
| `DELETE` | `/songs/{id}`      | Delete a song        |
| `GET`    | `/notes/{song_id}` | Get notes for a song |
| `POST`   | `/notes`           | Save recorded notes  |

---

## Conclusion

**Virtuoso Synthesizer** is an interactive application that combines audio playback, recording, song management, and REST API integration.
