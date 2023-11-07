const util = require('util');
const fs = require('fs');

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const uuidv1 = require('uuid/v1');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class Store {
	read() {
		return readFile('db/db.json', 'utf8');
	}

	write(note) {
		return writeFile('db/db.json', JSON.stringify(note));
	}

	getNotes() {
		return this.read().then((notes) => {
			let notesObj;
			try {
				notesObj = [].concat(JSON.parse(notes));
			} catch (err) {
				notesObj = [];
			}
			return notesObj;
		});
	}
	//create a note
	createNote(note) {
		const { title, text } = note;

		if (!title || !text) {
			throw new Error("Note 'title' and 'text' cannot be blank");
		}

		const note = { title, text, id: uuidv1() };

		return this.getNotes()
			.then((notes) => [...notes, note])
			.then((updatedNotes) => this.write(updatedNotes))
			.then(() => note);
	}
	//remove notes
	deleteNote(id) {
		return this.getNotes()
			.then((notes) => notes.filter((note) => note.id !== id))
			.then((filteredNotes) => this.write(filteredNotes));
	}
}

module.exports = new Store();
