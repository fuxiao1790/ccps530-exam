const PAGE_EMPTY = 1
const PAGE_LOGIN = 2
const PAGE_REGISTER = 3
const PAGE_MAIN_CONTNET = 5

const SERVER_ADDR = "http://localhost"
const SERVER_PORT = "8080"

let map = null
let marker = null

let state = {
    username: "",
    loggedIn: false,
    page: PAGE_EMPTY,
    token: "",
    displayLookupResult: false,
    lookupResult: {},
}

const SetState = (next = {}) => {
    let prev = JSON.parse(JSON.stringify(state))
    state = { ...state, ...next }

    if (state.username !== prev.username || state.loggedIn !== prev.loggedIn || state.token !== prev.token){
        RenderNavBar()
    }

    if(state.page !== prev.page || state.token !== prev.token) {
        RenderMainContent()
    }

    if (state.displayLookupResult !== prev.displayLookupResult || state.lookupResult !== prev.lookupResult) {
        RenderLookupResult()
    }
}

// RENDER NAV BAR CONTENT //
const RenderEmptyUserNavBar = () => `
    <a class="nav-item nav-link active" href="#" id="login" onclick="OnClickNavLogin()">Login</a>
    <a class="nav-item nav-link active" href="#" id="register" onclick="OnClickNavRegister()">Register</a>
`

const RenderUserNavBar = () => `
    <a class="nav-item nav-link active" href="#" id="username" onclick="OnClickNavUserName()">Hello! ${state.username}</a>
    <a class="nav-item nav-link active" href="#" id="logout" onclick="OnClickNavLogout()">Logout</a>
`

const RenderNavBar = () => {
    $("#nav-bar-container").empty()

    if (!state.loggedIn) {
        $("#nav-bar-container").append(RenderEmptyUserNavBar())
        return
    }

    $("#nav-bar-container").append(RenderUserNavBar())
}
// RENDER NAV BAR CONTENT //

// RENDER MAIN BODY CONTENT //
const RenderEmptyMainContent = () => `Please login first`

const RenderLoginMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-login-username">Username</span>
        </div>
        <input id="input-login-username" type="text" class="form-control" aria-label="Small"
            aria-describedby="inputGroup-sizing-sm-login-username">
    </div>

    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-login-password">Password</span>
        </div>
        <input id="input-login-password" type="password" class="form-control" aria-label="Small"
            aria-describedby="inputGroup-sizing-sm-login-password">
    </div>

    <button class="btn btn-primary" onclick="OnClickLogin()">Login</button>
`

const RenderRegisterMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-register-username">Username</span>
        </div>

        <input id="input-register-username" type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm-register-username">
    </div>

    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-register-password">Password</span>
        </div>
        <input id="input-register-password" type="password" class="form-control" aria-label="Small"aria-describedby="inputGroup-sizing-sm-register-password">
    </div>

    <button class="btn btn-primary" onclick="OnClickRegister()">Register</button>
`

const RenderUserMainContent = () => `
    <div class="input-group input-group-sm mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm-main-word">Word</span>
        </div>
        <input id="input-main-word" type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm-main-word">
        <div class="input-group-append">
            <button class="btn btn-primary" onclick="OnClickLookup()">Look Up</button>
        </div>
    </div>
`

const RenderMainContent = () => {
    $("#main-content-container").empty()
    
    switch (state.page) {
        case PAGE_LOGIN: {
            $("#main-content-container").append(RenderLoginMainContent())
            break;
        }
        case PAGE_EMPTY: {
            $("#main-content-container").append(RenderEmptyMainContent())
            break;
        }
        case PAGE_REGISTER: {
            $("#main-content-container").append(RenderRegisterMainContent())
            break;
        }
        case PAGE_MAIN_CONTNET: {
            $("#main-content-container").append(RenderUserMainContent())
            break;
        }
    }
}

const RenderDefinition = () => {
    const definition = `
        <h4>Definition</h4>
        <p>${state.lookupResult.def}</p>
    `
    $("#lookup-result").append(definition)
}

const RenderIllustration = () => {
    if (state.lookupResult.artid === "") {
        const illustration = `
            <h4>Illustration</h4>
            <img src="https://i.imgur.com/D1nM11A.png" alt="illustration not found"/>
        `
        $("#lookup-result").append(illustration)
        return
    }

    const illustration = `
        <h4>Illustration</h4>
        <img src="https://www.merriam-webster.com/assets/mw/static/art/dict/${state.lookupResult.artid}.gif" alt="illustration of the search term"/>
        <p>${state.lookupResult.capt}</p>
    `
    $("#lookup-result").append(illustration)
}

const RenderLookupResult = () => {
    if (!state.displayLookupResult) {
        return
    }

    $("#lookup-result").empty()
    RenderDefinition()
    RenderIllustration()
}
// RENDER MAIN BODY CONTENT //

// ON CLICK HANDLERES // 
const OnClickNavLogin = () =>  {
    if (state.loggedIn) {
        return
    }

    SetState({ 
        page: PAGE_LOGIN, 
        displayLookupResult: false,
    })
}

const OnClickNavLogout = () => {
    if (!state.loggedIn) {
        return
    }
    SetState({
        username: "",
        loggedIn: false, 
        page: PAGE_EMPTY,
        token: "",
        displayLookupResult: false,
    })
    window.alert("logged out")
}

const OnClickNavRegister = () => {
    if (state.loggedIn) {
        return
    }

    SetState({ 
        page: PAGE_REGISTER, 
        displayLookupResult: false
    })
}   

const OnClickNavUserName = () => {
    if (state.loggedIn) {
        return
    }
}

const Login = (username = "", password = "") => fetch(`${SERVER_ADDR}:${SERVER_PORT}/api/login`, {
    method: "POST", 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    })
})

const Register = (username = "", password = "") => fetch(`${SERVER_ADDR}:${SERVER_PORT}/api/register`, {
    method: "POST", 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    })
})

const Lookup = (word = "", token = "") => fetch(`${SERVER_ADDR}:${SERVER_PORT}/api/lookup?word=${word}`, {
    method: "GET", 
    headers: { 'Authorization': `Bearer ${token}` },
}) 

const OnClickLogin = () => {
    const username = $("#input-login-username").val()
    const password = $("#input-login-password").val()

    Login(username, password)
        .then(res => res.json())
        .then(res => {
            console.log(res)

            if (res.error) {
                window.alert(res.error)
                return
            }

            window.alert("success")
            SetState({
                username: res.username,
                loggedIn: true, 
                page: PAGE_MAIN_CONTNET,
                token: res.token,
                displayLookupResult: false
            })
            
        })
        .catch(err => {
            window.alert(err)
        })
}

const OnClickRegister = () => {
    const username = $("#input-register-username").val()
    const password = $("#input-register-password").val()

    Register(username, password)
        .then(res => res.json())
        .then(res => {
            console.log(res)

            if (res.error) {
                window.alert(res.error)
                return
            }

            window.alert("success")

            SetState({
                username: res.username,
                loggedIn: true, 
                page: PAGE_MAIN_CONTNET,
                token: res.token,
                displayLookupResult: false
            })
        })
        .catch(err => {
            window.alert(err)
        })
}

const OnClickLookup  = () => {
    console.log("OnClickLookup")
    const word = $("#input-main-word").val()

    Lookup(word, state.token)
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                window.alert(res.error)
                return
            }

            SetState({ 
                displayLookupResult: true,
                lookupResult: res,
            })
        })
        .catch(err => {
            window.alert(err)
        })
}

// ON CLICK HANDLERES // 
$(document).ready(() => {
    RenderNavBar()
    RenderMainContent()
})