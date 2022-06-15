require("dotenv").config()

const
    express = require("express"),
    PORT = process.env.PORT || 3000,
    secret = process.env.SECRET,
    app = express(),
    jwt = require("jsonwebtoken")

app.use(express.json())

function createToken(data) {
    return jwt.sign(data, secret, { expiresIn: "10m" })
}

function verifyToken(token) {
    const data = jwt.verify(token, secret)
    console.log(data);
    return data
}

const users = [
    { name: "avi", email: "a@a", password: "1234" },
    { name: "john", email: "b@b", password: "1234", isAdmin: true }
]

function login(email, password) {
    if (!email || !password) throw "missing data"
    const foundUser = users.find(u => u.email === email)
    if (!foundUser || foundUser.password !== password) throw "not auth"
    const token = createToken({ email: foundUser.email })
    return token
}

app.post("/login", (req, res) => {
    const { email, password } = req.body
    try {
        const logUser = login(email, password)
        res.send(logUser)
    } catch (error) {
        res.send(error.message || error)
    }
})

function auth(req, res, next) {
    const token = req.headers.authorization
    try {
        const data = verifyToken(token)
        const user = users.find(u => u.email === data.email)
        req.user = user
        return next()
    } catch (error) {
        res.send("not auth")
    }
}

function authAdmin(req, res, next) {
    const token = req.headers.authorization
    try {
        const data = verifyToken(token)
        const user = users.find(u => u.email === data.email)
        if (!user.isAdmin) throw ""
        req.user = user
        next()
    } catch (error) {
        res.send("not auth")
    }
}


app.get("/test", authAdmin, (req, res) => {
    console.log(req.user);
    try {
        res.send("you are connected")
    } catch (error) {
        res.send(error.message || error)
    }
})

app.listen(PORT, () => console.log("yayyyy!"))


