const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1: get all the notes using: GET : "/api/auth/fetchallnotes"  login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // Fetch all notes for the logged-in user
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
})

// Route 2: add a new note using: POST : "/api/notes/addnote"  login required
router.post('/addnote', fetchuser, [
    body('title').isLength({ min: 3 }).withMessage('Enter a valid title'),
    body('description').isLength({ min: 2 }).withMessage('Description must be at least 2 characters long')
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        
        // Check if a note with the same description already exists for the logged-in user
        const existingNote = await Note.findOne({ description, user: req.user.id });
        if (existingNote) {
            return res.status(400).json({ error: 'A note with the same description already exists' });
        }

        // If there are no existing notes with the same description, proceed to validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // If there are no validation errors, create and save the new note
        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const saveNote = await note.save();
        res.json(saveNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
})

// Route 3: Update an existing note using: PUT : "/api/notes/updatenote"  login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
const {title, description ,tag} = req.body;
try {
    
// create a newNote object
const newNote = {};
if(title){newNote.title = title};
if(description){newNote.description = description};
if(tag){newNote.tag = tag};

//find the note to be updated and update it
let note = await Note.findById(req.params.id);
if(!note){return res.status(404).send("Not Found")}

if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
}

note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
res.json({note});
}catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occurred");
}
})

// Route 4: DELETE an existing note using: DELETE : "/api/notes/deletenote"  login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const {title, description ,tag} = req.body;
   
    try{
    //find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}
    
    //allow deletion if user owns this note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }
    
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "note has been deleted", note: note});
}catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occurred");
}
})

module.exports = router;
