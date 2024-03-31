//DELETE ACCOUNT
//Account Deletion Request Endpoint
app.post("/delete-account", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await queryTheDatabaseWithCallback("SELECT * FROM users WHERE username = ?", [username]);
        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }


        await queryTheDatabaseWithCallback("DELETE FROM users WHERE username = ?", [username]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
