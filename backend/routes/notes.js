const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');

//Route 1: Get All the notes using : GET "/api/notes/fetchallnotes".  Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)   
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
})

//Route 2: Add a new Note using : POST "/api/notes/addnote".  Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // console.log('Request received:', req.body);
    try {

        const { title, description, tag } = req.body;
        // if error return bad request & errors 
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error"); 
    }    
})

//Route 3: update an existing Note using : PUT "/api/notes/updatenote".  Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const{ title, description, tag } = req.body;
    // new node object
    const newNote = {};
    if( title ){ newNote.title =  title };
    if( description ){ newNote.description =  description };
    if( tag ){ newNote.tag =  tag };

    //find the node to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(400).send("Not Found")};
    
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    
    note = await Note.findByIdAndUpdate( req.params.id, {$set : newNote}, {new: true} )
    res.json({note});
})

// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        // Allow deletion only if user owns this Note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;