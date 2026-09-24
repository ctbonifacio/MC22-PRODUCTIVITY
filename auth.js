import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================================
   CONFIG
========================================================= */

const cfg = window.MC22_CONFIG;

if (!cfg) {
    throw new Error("MC22_CONFIG is missing.");
}

const sb = createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
);


/* =========================================================
   ELEMENTS
========================================================= */

const usernameInput =
    document.getElementById("username");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const username =
        usernameInput.value.trim();


    if (!username) {

        loginMessage.textContent =
            "Please enter your username.";

        return;

    }


    loginBtn.disabled = true;

    loginMessage.textContent =
        "Checking username...";


    try {

        const {
            data,
            error
        } = await sb
            .from("mc22_users")
            .select("username, role")
            .ilike(
                "username",
                username
            )
            .limit(1);


        if (error) {

            console.error(
                "SUPABASE LOGIN ERROR:",
                error
            );

            loginMessage.textContent =
                "Supabase error: " +
                error.message;

            loginBtn.disabled = false;

            return;

        }


        if (!data || data.length === 0) {

            loginMessage.textContent =
                "Username is not authorized.";

            loginBtn.disabled = false;

            return;

        }


        const account =
            data[0];


        localStorage.setItem(
            "mc22_username",
            account.username
        );


        localStorage.setItem(
            "mc22_role",
            account.role || "leader"
        );


        loginMessage.textContent =
            "Login successful. Loading...";


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 300);


    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );

        loginMessage.textContent =
            "Login failed. Check your connection.";

        loginBtn.disabled = false;

    }

}


/* =========================================================
   BUTTON
========================================================= */

loginBtn.addEventListener(
    "click",
    login
);


/* =========================================================
   ENTER KEY
========================================================= */

usernameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            login();

        }

    }
);
