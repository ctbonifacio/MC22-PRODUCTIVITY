import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================================
   CONFIG
========================================================= */

const cfg =
    window.MC22_CONFIG;


if (!cfg) {

    throw new Error(
        "MC22_CONFIG is missing."
    );

}


const sb =
    createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
    );


/* =========================================================
   ELEMENTS
========================================================= */

const usernameInput =
    document.querySelector(
        "#username"
    );


const loginBtn =
    document.querySelector(
        "#loginBtn"
    );


const loginMessage =
    document.querySelector(
        "#loginMessage"
    );


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    error = false
) {

    loginMessage.textContent =
        message;

    loginMessage.style.color =
        error
            ? "#c62828"
            : "#145a8d";

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const username =
        usernameInput.value
            .trim();


    if (!username) {

        showMessage(
            "Please enter your username.",
            true
        );

        return;
    }


    loginBtn.disabled =
        true;

    loginBtn.textContent =
        "Checking...";


    try {

        /* -----------------------------------------
           CHECK USERNAME
        ----------------------------------------- */

        const {
            data: user,
            error
        } = await sb
            .from("mc22_users")
            .select(
                "username, role, active"
            )
            .ilike(
                "username",
                username
            )
            .eq(
                "active",
                true
            )
            .maybeSingle();


        if (error) {

            console.error(
                "USERNAME CHECK ERROR:",
                error
            );

            showMessage(
                "Cannot check username: " +
                error.message,
                true
            );

            return;
        }


        if (!user) {

            showMessage(
                "Username is not authorized.",
                true
            );

            return;
        }


        /* -----------------------------------------
           CREATE ANONYMOUS SESSION
        ----------------------------------------- */

        const {
            data: authData,
            error: authError
        } = await sb.auth.signInAnonymously();


        if (authError) {

            console.error(
                "ANONYMOUS LOGIN ERROR:",
                authError
            );

            showMessage(
                "Authentication failed: " +
                authError.message,
                true
            );

            return;
        }


        if (!authData.session) {

            showMessage(
                "Could not create login session.",
                true
            );

            return;
        }


        /* -----------------------------------------
           SAVE MC22 USER
        ----------------------------------------- */

        localStorage.setItem(
            "mc22_username",
            user.username
        );


        localStorage.setItem(
            "mc22_role",
            user.role
        );


        showMessage(
            "Login successful. Opening dashboard..."
        );


        /* -----------------------------------------
           OPEN DASHBOARD
        ----------------------------------------- */

        setTimeout(() => {

            location.href =
                "index.html";

        }, 500);


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        showMessage(
            "Login failed. Please try again.",
            true
        );

    } finally {

        loginBtn.disabled =
            false;

        loginBtn.textContent =
            "Login";

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

        if (
            event.key ===
            "Enter"
        ) {

            login();

        }

    }
);
