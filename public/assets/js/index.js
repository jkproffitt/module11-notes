let noteForm;
let title;
let details;
let saveBtn;
let createNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
	noteForm = document.querySelector('.note-form');
	title = document.querySelector('.note-title');
	details = document.querySelector('.note-textarea');
	saveBtn = document.querySelector('.save-note');
	createNoteBtn = document.querySelector('.new-note');
	clearBtn = document.querySelector('.clear-btn');
	noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
	elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
	elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
	fetch('/api/notes', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

const saveNote = (note) =>
	fetch('/api/notes', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(note),
	});

const deleteNote = (id) =>
	fetch(`/api/notes/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	});

const renderActiveNote = () => {
	hide(saveBtn);
	hide(clearBtn);

	if (activeNote.id) {
		show(createNoteBtn);
		title.setAttribute('readonly', true);
		details.setAttribute('readonly', true);
		title.value = activeNote.title;
		details.value = activeNote.text;
	} else {
		hide(createNoteBtn);
		title.removeAttribute('readonly');
		details.removeAttribute('readonly');
		title.value = '';
		details.value = '';
	}
};

const handleSave = () => {
	const newNote = {
		title: title.value,
		text: details.value,
	};
	saveNote(newNote).then(() => {
		getAndRenderNotes();
		renderActiveNote();
	});
};

// Delete the clicked note
const handleDelete = (e) => {
	// Prevents the click listener for the list from being called when the button inside of it is clicked
	e.stopPropagation();

	const note = e.target;
	const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

	if (activeNote.id === noteId) {
		activeNote = {};
	}

	deleteNote(noteId).then(() => {
		getAndRenderNotes();
		renderActiveNote();
	});
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
	e.preventDefault();
	activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
	renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
	activeNote = {};
	show(clearBtn);
	renderActiveNote();
};

// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
	show(clearBtn);
	if (!title.value.trim() && !details.value.trim()) {
		hide(clearBtn);
	} else if (!title.value.trim() || !details.value.trim()) {
		hide(saveBtn);
	} else {
		show(saveBtn);
	}
};

// Render the list of note titles
const renderNoteList = async (notes) => {
	let jsonNotes = await notes.json();
	if (window.location.pathname === '/notes') {
		noteList.forEach((el) => (el.innerHTML = ''));
	}

	let noteListItems = [];

	// Returns HTML element with or without a delete button
	const createLi = (text, deleteBtn = true) => {
		const liEl = document.createElement('li');
		liEl.classList.add('list-group-item');

		const spanEl = document.createElement('span');
		spanEl.classList.add('list-item-title');
		spanEl.innerText = text;
		spanEl.addEventListener('click', handleNoteView);

		liEl.append(spanEl);

		if (deleteBtn) {
			const delBtnEl = document.createElement('i');
			delBtnEl.classList.add(
				'fas',
				'fa-trash-alt',
				'float-right',
				'text-danger',
				'delete-note'
			);
			delBtnEl.addEventListener('click', handleDelete);

			liEl.append(delBtnEl);
		}

		return liEl;
	};

	if (jsonNotes.length === 0) {
		noteListItems.push(createLi('No saved Notes', false));
	}

	jsonNotes.forEach((note) => {
		const li = createLi(note.title);
		li.dataset.note = JSON.stringify(note);

		noteListItems.push(li);
	});

	if (window.location.pathname === '/notes') {
		noteListItems.forEach((note) => noteList[0].append(note));
	}
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
	saveBtn.addEventListener('click', handleSave);
	createNoteBtn.addEventListener('click', handleNewNoteView);
	clearBtn.addEventListener('click', renderActiveNote);
	noteForm.addEventListener('input', handleRenderBtns);
}

getAndRenderNotes();
