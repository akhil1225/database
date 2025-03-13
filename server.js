const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 5050;

app.use(cors())
app.use(bodyParser.json());

const readDb = () => {
    if (!fs.existsSync("db.json")) {
        fs.writeFileSync("db.json", JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync("db.json", "utf-8"));
};



const writeDb = (data) =>{
    fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}


app.get("/api/getUsers", (req, res) => {
    try{
        const db = readDb();
        res.json(db.users);
    } catch (err){
        res.status(500).json({message: "Internal server error" + err})
    }
    
})

app.get("/api/getUserbyId/:id", (req, res) =>{
    try{
        const db = readDb();
        const user = db.users.find( u => u.id === parseInt(req.params.id));
        if(!user) return res.status(404).json({message: "User not found"})
        res.json(user)
    } catch (err) {
        res.status(500).json({message: "Internal server error: "+err});
    }
})



app.post("/api/postUser", (req, res) =>{
    try{
        const { name, email, password} = req.body;
        if(!name || !email || !password) return res.status(400).json({message: "Name, email and password are required"});
        const db = readDb();

        const newUser = {id: db.users.length+1, name, email, password};
        db.users.push(newUser);
        writeDb(db);

        res.status(201).json({message: "New user added successfully"+newUser});
    } catch (err){
        res.status(500).json({message: "Internal server error"+err});
    }
})

app.put("/api/putUser/:id", (req, res) => {
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password) return res.status(400).json({message: "Name, email and password are required"});

        const db = readDb();
        const userId = db.users.findIndex(u => u.id === parseInt(req.params.id));
        if (userId === -1) return res.status(404).json({message: "User not found"});

        db.users[userId] = {id: parseInt(req.params.id), name, email, password};
        writeDb(db);

        res.status(200).json({message: "User updated successfully"+userId});
     } catch (err){
        res.status(500).json({message: "Internal server error"+err});
     }
})

app.delete("/api/deleteUser/:id", (req, res) => {
    try{
        const db = readDb();
        const filteredUsers = db.users.filter(u => u.id !== parseInt(req.params.id));

        if(filteredUsers.length === db.users.length) return res.status(404).json({error: "User not found"});

        db.users = filteredUsers;
        writeDb(db);

        res.json({message: "User deleted successfully!"});
    } catch (err){
        res.status(500).json({message: "Internal server error"+err});
    }
})

app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});
