const Express = require('express')
const Cors = require("cors")
const Bcrypt = require('bcryptjs')
const Jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const { MongoClient } = require('mongodb')

const PORT = 8080

const JWT_SECRET = "cDuO8EaVdp6cQUh8oVt0$JjiQw95szbLov/dWB8q27VqrkZYU1$2aUMZBO$CGwnWtyjXqIj4Fka"
const VALID_EMAIL_ADDRESS_REGEX = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
const VALID_PASSWORD_LENGTH = 8

const MONGO_DB_USER_NAME = "MCCNecTQY5qDyFRA"
const MONGO_DB_PASSWORD = "7SxKvu4DGmonJR2c"
const MONGO_DB_NAME = "CCPS530-EXAM"
const MONGO_DB_USER_COLLECTION_NAME = "USER"
const MONGO_DB_CACHE_COLLECTION_NAME = "CACHE"

const API_KEY = "f692e11c-304f-440b-996e-ce777f74472d"

const client = new MongoClient(`mongodb+srv://${MONGO_DB_USER_NAME}:${MONGO_DB_PASSWORD}@cluster0.vg63r.mongodb.net`)
let user_collection
let cache_collection
let db

const app = Express()

const SetupDb = async () => {
    await client.connect()
    db = client.db(MONGO_DB_NAME)
    user_collection = db.collection(MONGO_DB_USER_COLLECTION_NAME)
    cache_collection = db.collection(MONGO_DB_CACHE_COLLECTION_NAME)
    console.log("connected to db")
}

const GetUserDataByUsername = async (username = "") => {
    const user_data = await user_collection.findOne({username: username})

    if (user_data) {
        return {
            username: user_data.username,
            hash: user_data.hash,
            exists: true
        }
    } 

    return {
        username: "",
        hash: "",
        exists: false
    }
}

const AddNewUser = async (username = "", hash = "") => {
    try {
        const user = await user_collection.insertOne({username: username, hash: hash})
        console.log(user)
    } catch(err) {
        console.log("error adding new user " + err)
    }
}

const GetWordFromCache = async (name = "") => {
    try {
        const word_data = await cache_collection.findOne({word: name})

        if (word_data) {
            return { data: word_data, exists: true }
        }

        return { data: null, exists: false }

    } catch(err) {
        console.log("error looking up word " + err)
    }
}

const AddNewWordToCache = async (word = "", data = {}) => {
    try {
        const word_data = await cache_collection.insertOne({
            word: word, 
            data: data,
            createdAt: new Date(),
        })
        console.log(word_data)
    } catch(err) {
        console.log("error adding new user " + err)
    } 
}

const PrintEndpoint = (req, _, next) => {
    console.log(req.url)
    next()
}

const CreateSignedJwtWihtUsername = (username = "") => Jwt.sign({username: username}, JWT_SECRET)

const ValidateJwt = (req, res, next) => {

    if (!req.headers.authorization || 
        !req.headers.authorization instanceof String || 
        req.headers.authorization.length == 0) {

        res.status(403)
        res.json({error: "no auth info"})
        return
    }

    const token = GetTokenFromAuthHeadaer(req.headers.authorization)

    try {
        if (!Jwt.verify(token, JWT_SECRET)) {
            res.json({error: "bad token"})
            return
        }
    } catch(err) {
        res.json({error: err})
        return
    }
    

    next()
}

const CheckUserNameAndPassword = (req, res, next) => {

    if (!req.body.password instanceof String || 
        !req.body.username instanceof String || 
        !req.body.username || 
        !req.body.password ||
        req.body.password.length == 0 ||
        req.body.username.length == 0) {

        res.status(400)
        res.json({error: "username or password empty"})
        return
    }

    if (req.body.password.length < VALID_PASSWORD_LENGTH) {
        res.status(400)
        res.json({error: "password cannot be shorter than 8 characters"})
        return
    }

    if (!req.body.username.match(VALID_EMAIL_ADDRESS_REGEX)) {
        res.status(400)
        res.json({error: "invalid email address"})
        return
    }

    next()
}

const GetTokenFromAuthHeadaer = (str = "") => {
    const temp = str.split(" ")
    if (temp.length == 1) {
        return temp[0]
    }

    return temp[1]
}

const LoginHandler = async (req, res) => {
    const user_data = await GetUserDataByUsername(req.body.username)

    if (!user_data.exists) {
        res.status(400)
        res.json({error: "username password mismatch"})
        return
    }

    if (!Bcrypt.compareSync(req.body.password, user_data.hash)) {
        res.status(400)
        res.json({error: "username password mismatch"})
        return
    }

    const token = CreateSignedJwtWihtUsername(user_data.username)
    res.status(200)
    res.json({
        token: token,
        username: user_data.username,
    })
}

const CheckUsernameAvailability = async (req, res, next) => {
    const user_data = await GetUserDataByUsername(req.body.username)

    if (user_data.exists) {
        res.status(400)
        res.json({error: "username not available"})
        return
    }

    next()
}

const RegisterHandler = async (req, res) => {
    const salt = Bcrypt.genSaltSync()
    const hash = Bcrypt.hashSync(req.body.password, salt)

    await AddNewUser(req.body.username, hash)

    const token = CreateSignedJwtWihtUsername(req.body.username)
    res.status(200)
    res.json({
        token: token,
        username: req.body.username,
    })
}

const ValidateLookupInput = (req, res, next) => {
    if (!req.query.word || !req.query.word instanceof String || req.query.word.length === 0) {
        res.json({error: "word is empty"})
        return
    }

    next()
}

ApiDataToResult = (data = {}) => {
    let def = ""
    let artid = ""
    let capt = ""
    
    try { def = data[0].def[0].sseq[0][0][1].dt[0][1] }
    catch(err) { console.log(err) }

    try { def = data[0].def[0].sseq[0][1][1].dt[0][1]} 
    catch(err) { console.log(err) }

    try { artid = data[0].art.artid } 
    catch(err) { console.log(err) }

    try { capt = data[0].art.capt } 
    catch(err) { console.log(err) }

    return {
        def: def,
        artid: artid,
        capt: capt,
    }
}

const CheckCache = async (req, res, next) => {
    const word_data = await GetWordFromCache(req.query.word)
    if (word_data.exists) {
        res.json(ApiDataToResult(word_data.data.data))
        return
    }

    next()
}

const FetchWordDefFromApi = async (word = "") => {
    try {
        const res = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`)
        const data = await res.json()
        return { data: data, error: null }
    } catch(err) {
        return { data: null, error: err }
    }
}

const LookupHandler = async (req, res) => {
    const {data, error} = await FetchWordDefFromApi(req.query.word)
    if (error) {
        res.json({error: error})
        return
    }

    AddNewWordToCache(req.query.word, data)

    res.json(ApiDataToResult(data))
}

const SetupEndpoints = () => {
    app.post("/api/login", 
        PrintEndpoint,
        CheckUserNameAndPassword,
        LoginHandler,
    )

    app.post("/api/register", 
        PrintEndpoint,
        CheckUserNameAndPassword,
        CheckUsernameAvailability,
        RegisterHandler,
    )

    app.get("/api/lookup", 
        PrintEndpoint, 
        ValidateJwt,
        ValidateLookupInput,
        CheckCache,
        LookupHandler,
    )

    app.get("/", (_, res) => res.sendStatus(200))
}

const Init = async () => {
    app.use(Cors())
    app.use(Express.json())

    await SetupDb()
    SetupEndpoints()
}

const Start = () => {
    console.log(`STARTING SERVER AT PORT: ${PORT}`)
    app.listen(PORT)
}

Init().then(Start)

