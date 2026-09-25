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
   HELPERS
========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);


function toast(message) {

    let el = $("#toast");

    if (!el) {

        el = document.createElement("div");

        el.id = "toast";

        document.body.appendChild(el);
    }

    el.textContent = message;

    el.classList.add("show");

    clearTimeout(
        window.__toastTimer
    );

    window.__toastTimer =
        setTimeout(() => {

            el.classList.remove("show");

        }, 3000);
}


/* =========================================================
   LOGIN / ROLE
========================================================= */

const username =
    localStorage.getItem(
        "mc22_username"
    );

const currentRole =
    String(
        localStorage.getItem(
            "mc22_role"
        ) || ""
    ).toLowerCase();


if (!username) {

    window.location.href =
        "login.html";

    throw new Error(
        "Login required."
    );
}


if (
    currentRole !== "admin" &&
    currentRole !== "leader"
) {

    localStorage.removeItem(
        "mc22_username"
    );

    localStorage.removeItem(
        "mc22_role"
    );

    window.location.href =
        "login.html";

    throw new Error(
        "Invalid role."
    );
}


const isAdmin =
    currentRole === "admin";


function adminOnly() {

    if (!isAdmin) {

        toast(
            "Admin access required."
        );

        return false;
    }

    return true;
}


/* =========================================================
   CACHE
========================================================= */
let agentsCache = null;

let banksCache = null;

let activeBank = "OVERALL";

/* =========================================================
   PERFORMANCE TABLE SEARCH
========================================================= */

let performanceSearch = "";
/* =========================================================
   LEADER AUTO BANK ROTATION
========================================================= */

let autoBankRotationTimer = null;function startAutoBankRotation(banks) {

    // Stop any existing rotation
    if (autoBankRotationTimer) {
        clearInterval(autoBankRotationTimer);
        autoBankRotationTimer = null;
    }

    // Only leaders get automatic rotation
    if (isAdmin) {
        return;
    }

    const bankNames = [
        "OVERALL",
        ...banks.map(bank =>
            String(bank.bank).toUpperCase()
        )
    ];

    const uniqueBanks = [
        ...new Set(bankNames)
    ];

    if (uniqueBanks.length <= 1) {
        return;
    }

    // Start from current bank
    let currentIndex =
        uniqueBanks.indexOf(activeBank);

    if (currentIndex < 0) {
        currentIndex = 0;
        activeBank = uniqueBanks[0];
    }

    autoBankRotationTimer = setInterval(
        async () => {

            currentIndex =
                (currentIndex + 1) %
                uniqueBanks.length;

            activeBank =
                uniqueBanks[currentIndex];

            // Re-render tabs
            renderBankTabs(banks);

            // Update target boxes
            renderMonthlyTargets(banks);






            // Update dashboard
            await renderDashboard(false);

        },
       1 * .30 * 1000    // Rotate every 5 minutes
    );
}

/* =========================================================
   AUTH DISPLAY
========================================================= */

function showUserInfo() {

    const usernameEls =
        $$(
            "#currentUsername, .current-username"
        );

    usernameEls.forEach(
        el => {

            el.textContent =
                username;
        }
    );


    const roleEls =
        $$(
            "#currentRole, .current-role"
        );

    roleEls.forEach(
        el => {

            el.textContent =
                currentRole.toUpperCase();
        }
    );
}


/* =========================================================
   ROLE ACCESS
========================================================= */

function applyRoleAccess() {

    if (isAdmin) {
        return;
    }


    /*
       LEADER = DASHBOARD ONLY
    */


    const performanceTable =
        $("#dataTable");

    if (performanceTable) {

        const section =
            performanceTable.closest(
                "section"
            );

        if (section) {

            section.style.display =
                "none";
        }
    }


    const bankTable =
        $("#bankTable");

    if (bankTable) {

        const section =
            bankTable.closest(
                "section"
            );

        if (section) {

            section.style.display =
                "none";
        }
    }


    const adminElements = [

        "#addBtn",
        "#refreshBtn",
        "#addBankBtn",
        "#refreshBankBtn",
        "#saveBankBtn",
        "#deleteBankBtn"

    ];


    adminElements.forEach(
        selector => {

            $$(selector).forEach(
                element => {

                    element.style.display =
                        "none";
                }
            );
        }
    );


    /*
       Hide common admin tabs
       while keeping Dashboard.
    */

    const tabSelectors = [

        '[data-tab="performance"]',
        '[data-tab="performance-table"]',
        '[data-tab="bank"]',
        '[data-tab="bank-table"]'

    ];


    tabSelectors.forEach(
        selector => {

            $$(selector).forEach(
                element => {

                    element.style.display =
                        "none";
                }
            );
        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "mc22_username"
    );

    localStorage.removeItem(
        "mc22_role"
    );

    window.location.href =
        "login.html";
}


$("#logoutBtn")?.addEventListener(
    "click",
    logout
);


/* =========================================================
   GET AGENTS
========================================================= */

async function getAgents(
    forceRefresh = false
) {

    if (
        agentsCache &&
        !forceRefresh
    ) {

        return agentsCache;
    }


    const {
        data,
        error
    } = await sb
        .from("agents")
        .select(`
            id,
            name,
            bank,
            talk_actual,
            rpc_actual,
            nptp_actual,
            npayment_actual,
            message,
            accent,
            photo_data,
            photo_url
        `)
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "GET AGENTS ERROR:",
            error
        );

        toast(
            "Cannot load agents: " +
            error.message
        );

        return [];
    }


    agentsCache =
        data || [];


    return agentsCache;
}


/* =========================================================
   GET BANKS
========================================================= */

async function getBanks(
    forceRefresh = false
) {

    if (
        banksCache &&
        !forceRefresh
    ) {

        return banksCache;
    }


    const {
        data,
        error
    } = await sb
        .from("bank_targets")
        .select("*")
        .order(
            "bank",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "GET BANKS ERROR:",
            error
        );

        toast(
            "Cannot load banks: " +
            error.message
        );

        return [];
    }


    banksCache =
        data || [];


    return banksCache;
}


/* =========================================================
   NUMBER
========================================================= */

function number(value) {

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;
}


/* =========================================================
   PERCENTAGE
========================================================= */

function percentage(
    actual,
    target
) {

    actual =
        number(actual);

    target =
        number(target);


    if (
        target <= 0
    ) {

        return 0;
    }


    return (
        actual /
        target
    ) * 100;
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value
) {

    return number(
        value
    ).toLocaleString();
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

async function compressImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const image =
                        new Image();


                    image.onload =
                        () => {

                            const maxWidth =
                                500;

                            const maxHeight =
                                500;


                            let width =
                                image.width;

                            let height =
                                image.height;


                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    Math.round(
                                        height *
                                        (
                                            maxWidth /
                                            width
                                        )
                                    );

                                width =
                                    maxWidth;
                            }


                            if (
                                height >
                                maxHeight
                            ) {

                                width =
                                    Math.round(
                                        width *
                                        (
                                            maxHeight /
                                            height
                                        )
                                    );

                                height =
                                    maxHeight;
                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );


                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.75
                                )
                            );
                        };


                    image.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Invalid image."
                                )
                            );
                        };


                    image.src =
                        event.target.result;
                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   SHOW PHOTO
========================================================= */

function showPhoto(
    photo,
    container
) {

    if (!container) {
        return;
    }


    if (!photo) {

        container.innerHTML = `
            <div class="profile-photo-placeholder">
                👤
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <img
            class="profile-photo-preview"
            src="${photo}"
            alt="Agent photo"
            style="display:block;"
        >
    `;
}


/* =========================================================
   GET PHOTO
========================================================= */

function getPhoto(
    agent
) {

    return (
        agent.photo_data ||
        agent.photo_url ||
        ""
    );
}


/* =========================================================
   GET BANK TARGET
========================================================= */

function getBankTarget(
    banks,
    bank
) {

    return banks.find(
        item =>
            String(
                item.bank
            ).toUpperCase() ===
            String(
                bank
            ).toUpperCase()
    );
}


/* =========================================================
   BANK TARGET VALUE
========================================================= */

function targetValue(
    bank,
    field,
    banks
) {

    const target =
        getBankTarget(
            banks,
            bank
        );


    if (!target) {
        return 0;
    }


    return number(
        target[field]
    );
}


/* =========================================================
   AGENT ACHIEVEMENT
========================================================= */

function agentAchievement(
    agent,
    bankTarget
) {

    if (!bankTarget) {
        return 0;
    }


    const values = [

        percentage(
            agent.talk_actual,
            bankTarget.talk_target
        ),

        percentage(
            agent.rpc_actual,
            bankTarget.rpc_target
        ),

        percentage(
            agent.nptp_actual,
            bankTarget.nptp_target
        ),

        percentage(
            agent.npayment_actual,
            bankTarget.npayment_target
        )

    ];


    const valid =
        values.filter(
            value =>
                Number.isFinite(
                    value
                )
        );


    if (!valid.length) {
        return 0;
    }


    return (
        valid.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        ) /
        valid.length
    );
}


/* =========================================================
   OVERALL TARGETS
========================================================= */

function overallTargets(
    banks
) {

    return {

        talk_target:
            banks.reduce(
                (
                    total,
                    bank
                ) =>
                    total +
                    number(
                        bank.talk_target
                    ),
                0
            ),

        rpc_target:
            banks.reduce(
                (
                    total,
                    bank
                ) =>
                    total +
                    number(
                        bank.rpc_target
                    ),
                0
            ),

        nptp_target:
            banks.reduce(
                (
                    total,
                    bank
                ) =>
                    total +
                    number(
                        bank.nptp_target
                    ),
                0
            ),

        npayment_target:
            banks.reduce(
                (
                    total,
                    bank
                ) =>
                    total +
                    number(
                        bank.npayment_target
                    ),
                0
            )
    };
}


/* =========================================================
   AGENT TARGET
========================================================= */

function getAgentTarget(
    agent,
    banks
) {

    if (
        String(
            activeBank
        ).toUpperCase() ===
        "OVERALL"
    ) {

        return overallTargets(
            banks
        );
    }


    return getBankTarget(
        banks,
        agent.bank
    ) || {
        talk_target: 0,
        rpc_target: 0,
        nptp_target: 0,
        npayment_target: 0
    };
}


/* =========================================================
   METRIC CARD
========================================================= */

function metricCard(
    label,
    actual,
    target,
    colorClass
) {

    const actualValue =
        number(actual);

    const targetValueNumber =
        number(target);

    const percent =
        percentage(
            actualValue,
            targetValueNumber
        );

    const capped =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );

    const variance =
        targetValueNumber -
        actualValue;

    return `
        <div class="metric-card ${colorClass}">

            <div class="metric-main">

                <div
                    class="metric-circle"
                       style="
        --circle-deg:${capped * 3.6}deg;
    "

                >
                    <span>
                        ${Math.round(percent)}%
                    </span>
                </div>

                <div class="metric-values">

                    <div class="metric-line">
                        <span>TARGET</span>

                        <strong>
                            ${formatNumber(
                                targetValueNumber
                            )}
                        </strong>
                    </div>

                    <div class="metric-line">
                        <span>ACTUAL</span>

                        <strong>
                            ${formatNumber(
                                actualValue
                            )}
                        </strong>
                    </div>

                    <div class="metric-line">
                        <span>VARIANCE</span>

                        <strong>
                            ${formatNumber(
                                variance
                            )}
                        </strong>
                    </div>

                </div>

            </div>

            <div class="metric-ratio">
                ${formatNumber(actualValue)}
                /
                ${formatNumber(targetValueNumber)}
            </div>

        </div>
    `;
}

/* =========================================================
   AGENT DASHBOARD CARD
========================================================= */

function agentCard(
    agent
) {

    const photo =
        getPhoto(agent);


    return `
        <div
            class="agent-card"
            style="
                --agent-accent:
                ${escapeHTML(
                    agent.accent ||
                    "#1478c9"
                )};
            "
        >

            ${
                photo
                ?
                `
                    <img
                        class="agent-photo"
                        src="${photo}"
                        alt="${escapeHTML(
                            agent.name
                        )}"
                    >
                `
                :
                `
                    <div class="
                        agent-photo
                        placeholder
                    ">
                        👤
                    </div>
                `
            }


            <span class="agent-name">
                ${escapeHTML(
                    agent.name
                )}
            </span>


            <span class="agent-bank">
                ${escapeHTML(
                    agent.bank
                )}
            </span>


            <p class="agent-message">
                ${escapeHTML(
                    agent.message ||
                    "KEEP GOING! 💙"
                )}
            </p>

        </div>
    `;
}


/* =========================================================
   RENDER DASHBOARD
========================================================= */

async function renderDashboard(
    forceRefresh = false
) {

    const rows =
        $("#rows");


    if (!rows) {
        return;
    }


    const [
        agents,
        banks
    ] = await Promise.all([

        getAgents(
            forceRefresh
        ),

        getBanks(
            forceRefresh
        )

    ]);


    let visibleAgents =
        agents;


    /*
       OVERALL
       shows all agents
    */

    if (
        activeBank !==
        "OVERALL"
    ) {

        visibleAgents =
            agents.filter(
                agent =>
                    String(
                        agent.bank
                    ).toUpperCase() ===
                    String(
                        activeBank
                    ).toUpperCase()
            );
    }


    /*
       SORT BY ACHIEVEMENT
    */

    visibleAgents =
        [...visibleAgents]
            .sort(
                (
                    a,
                    b
                ) => {

                    const targetA =
                        getAgentTarget(
                            a,
                            banks
                        );

                    const targetB =
                        getAgentTarget(
                            b,
                            banks
                        );


                    return (
                        agentAchievement(
                            b,
                            targetB
                        ) -
                        agentAchievement(
                            a,
                            targetA
                        )
                    );
                }
            );


    if (!visibleAgents.length) {

        rows.innerHTML = `
            <div class="empty-state">
                No agents found.
            </div>
        `;

        return;
    }


    rows.innerHTML = "";


    visibleAgents.forEach(
        agent => {

            const target =
                getAgentTarget(
                    agent,
                    banks
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "dashboard-row";


            row.innerHTML = `

                ${agentCard(agent)}

                ${metricCard(
                    "TALKTIME",
                    agent.talk_actual,
                    target.talk_target,
                    "metric-talk"
                )}

                ${metricCard(
                    "RPC",
                    agent.rpc_actual,
                    target.rpc_target,
                    "metric-rpc"
                )}

                ${metricCard(
                    "NPTP",
                    agent.nptp_actual,
                    target.nptp_target,
                    "metric-nptp"
                )}

                ${metricCard(
                    "PAYMENT",
                    agent.npayment_actual,
                    target.npayment_target,
                    "metric-npay"
                )}

            `;


            rows.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   BANK TABS
========================================================= */

function renderBankTabs(
    banks
) {

    const container =
        $("#bankTabs");


    if (!container) {
        return;
    }


    const names = [
        "OVERALL",
        ...banks.map(
            bank =>
                String(
                    bank.bank
                ).toUpperCase()
        )
    ];


    const uniqueNames =
        [...new Set(names)];


    container.innerHTML =
        uniqueNames.map(
            bank => `

                <button
                    type="button"
                    class="bank-tab ${
                        activeBank === bank
                            ? "active"
                            : ""
                    }"
                    data-bank="${escapeHTML(
                        bank
                    )}"
                >
                    ${escapeHTML(
                        bank
                    )}
                </button>

            `
        ).join("");


    container
        .querySelectorAll(
            ".bank-tab"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        activeBank =
                            button.dataset.bank;


                        container
                            .querySelectorAll(
                                ".bank-tab"
                            )
                            .forEach(
                                tab => {

                                    tab.classList.toggle(
                                        "active",
                                        tab ===
                                        button
                                    );
                                }
                            );


                        await renderDashboard(
                            false
                        );
                    }
                );
            }
        );
}


/* =========================================================
   MONTHLY TARGETS
========================================================= */

function renderMonthlyTargets(
    banks
) {

    const container =
        $("#monthlyValues");


    if (!container) {
        return;
    }


    let target;


    if (
        activeBank ===
        "OVERALL"
    ) {

        target =
            overallTargets(
                banks
            );

    } else {

        target =
            getBankTarget(
                banks,
                activeBank
            ) || {
                talk_target: 0,
                rpc_target: 0,
                nptp_target: 0,
                npayment_target: 0
            };
    }


    const values = [

        [
            "TALKTIME",
            target.talk_target,
            "talk-target-box"
        ],

        [
            "RPC",
            target.rpc_target,
            "rpc-target-box"
        ],

        [
            "NPTP",
            target.nptp_target,
            "ptp-target-box"
        ],

        [
            "PAYMENT",
            target.npayment_target,
            "payment-target-box"
        ]

    ];


    container.innerHTML =
        values.map(
            item => `

                <div
                    class="
                        monthly-item
                        ${item[2]}
                    "
                >

                    <span>
                        ${item[0]}
                    </span>

                    <strong>
                        ${formatNumber(
                            item[1]
                        )}
                    </strong>

                </div>

            `
        ).join("");
}


/* =========================================================
   RENDER BANK AREA
========================================================= */

async function renderBankArea(
    forceRefresh = false
) {

    const [
        agents,
        banks
    ] = await Promise.all([

        getAgents(
            forceRefresh
        ),

        getBanks(
            forceRefresh
        )

    ]);


    renderBankTabs(
        banks
    );


    renderMonthlyTargets(
        banks
    );


    /*
       Render dashboard using
       already cached data.
    */

    await renderDashboard(
        false
    );
}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

async function refreshDashboard() {

    agentsCache = null;

    banksCache = null;

    await renderBankArea(
        true
    );

    toast(
        "Dashboard refreshed."
    );
}


/* =========================================================
   ADD AGENT
========================================================= */

async function addAgent(
    agentData = {}
) {

    if (!adminOnly()) {
        return;
    }


    const newAgent = {

        name:
            agentData.name ||
            "New Agent",

        bank:
            agentData.bank ||
            "ENBD",

        talk_actual:
            number(
                agentData.talk_actual
            ),

        rpc_actual:
            number(
                agentData.rpc_actual
            ),

        nptp_actual:
            number(
                agentData.nptp_actual
            ),

        npayment_actual:
            number(
                agentData.npayment_actual
            ),

        message:
            agentData.message ||
            "KEEP GOING! 💙",

        accent:
            agentData.accent ||
            "#1478c9",

        photo_data:
            agentData.photo_data ||
            null,

        photo_url:
            null
    };


    const {
        data,
        error
    } = await sb
        .from("agents")
        .insert(
            newAgent
        )
        .select()
        .single();


    if (error) {

        console.error(
            "ADD AGENT ERROR:",
            error
        );

        toast(
            "Cannot add agent: " +
            error.message
        );

        return null;
    }


    agentsCache = null;


    toast(
        "Agent added successfully."
    );


    await renderDashboard(
        true
    );


    return data;
}


/* =========================================================
   UPDATE AGENT
========================================================= */

async function updateAgent(
    id,
    values
) {

    if (!adminOnly()) {
        return;
    }


    const {
        error
    } = await sb
        .from("agents")
        .update(
            values
        )
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "UPDATE AGENT ERROR:",
            error
        );

        toast(
            "Cannot save agent: " +
            error.message
        );

        return false;
    }


    agentsCache = null;


    toast(
        "Agent saved."
    );


    await renderDashboard(
        true
    );


    return true;
}


/* =========================================================
   DELETE AGENT
========================================================= */

async function deleteAgent(
    id
) {

    if (!adminOnly()) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this agent?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await sb
        .from("agents")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "DELETE AGENT ERROR:",
            error
        );

        toast(
            "Cannot delete agent: " +
            error.message
        );

        return;
    }


    agentsCache = null;


    toast(
        "Agent deleted."
    );


    await renderDashboard(
        true
    );
}


/* =========================================================
   SAVE PHOTO DIRECTLY TO AGENTS
========================================================= */

async function saveAgentPhoto(
    agentId,
    file
) {

    if (!adminOnly()) {
        return;
    }


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        toast(
            "Please select an image."
        );

        return;
    }


    try {

        toast(
            "Compressing photo..."
        );


        const photoData =
            await compressImage(
                file
            );


        const {
            error
        } = await sb
            .from("agents")
            .update({

                photo_data:
                    photoData,

                photo_url:
                    null

            })
            .eq(
                "id",
                agentId
            );


        if (error) {

            console.error(
                "PHOTO DATABASE ERROR:",
                error
            );

            toast(
                "Cannot save photo: " +
                error.message
            );

            return;
        }


        agentsCache = null;


        toast(
            "Photo saved successfully."
        );


        await renderDashboard(
            true
        );

    } catch (error) {

        console.error(
            "PHOTO ERROR:",
            error
        );

        toast(
            "Cannot save photo: " +
            error.message
        );
    }
}


/* =========================================================
   REMOVE PHOTO
========================================================= */

async function removeAgentPhoto(
    agentId
) {

    if (!adminOnly()) {
        return;
    }


    const {
        error
    } = await sb
        .from("agents")
        .update({

            photo_data:
                null,

            photo_url:
                null

        })
        .eq(
            "id",
            agentId
        );


    if (error) {

        toast(
            "Cannot remove photo: " +
            error.message
        );

        return;
    }


    agentsCache = null;


    toast(
        "Photo removed."
    );


    await renderDashboard(
        true
    );
}


/* =========================================================
   ADD BANK
========================================================= */

async function addBank(
    bankData = {}
) {

    if (!adminOnly()) {
        return;
    }


    const newBank = {

        bank:
            bankData.bank ||
            "NEW BANK",

        talk_target:
            number(
                bankData.talk_target
            ),

        rpc_target:
            number(
                bankData.rpc_target
            ),

        nptp_target:
            number(
                bankData.nptp_target
            ),

        npayment_target:
            number(
                bankData.npayment_target
            )
    };


    const {
        data,
        error
    } = await sb
        .from("bank_targets")
        .insert(
            newBank
        )
        .select()
        .single();


    if (error) {

        console.error(
            "ADD BANK ERROR:",
            error
        );

        toast(
            "Cannot add bank: " +
            error.message
        );

        return null;
    }


    banksCache = null;


    toast(
        "Bank added successfully."
    );


    await renderBankArea(
        true
    );


    return data;
}


/* =========================================================
   UPDATE BANK
========================================================= */

async function updateBank(
    id,
    values
) {

    if (!adminOnly()) {
        return;
    }


    const {
        error
    } = await sb
        .from("bank_targets")
        .update(
            values
        )
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "UPDATE BANK ERROR:",
            error
        );

        toast(
            "Cannot save bank: " +
            error.message
        );

        return false;
    }


    banksCache = null;


    toast(
        "Bank saved."
    );


    await renderBankArea(
        true
    );


    return true;
}


/* =========================================================
   DELETE BANK
========================================================= */

async function deleteBank(
    id
) {

    if (!adminOnly()) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this bank?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await sb
        .from("bank_targets")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "DELETE BANK ERROR:",
            error
        );

        toast(
            "Cannot delete bank: " +
            error.message
        );

        return;
    }


    banksCache = null;


    toast(
        "Bank deleted."
    );


    await renderBankArea(
        true
    );
}


/* =========================================================
   PERFORMANCE TABLE
========================================================= */
/* =========================================================
   PERFORMANCE TABLE
========================================================= */

async function renderPerformanceTable() {

    if (!isAdmin) {
        return;
    }


    const table =
        $("#dataTable");


    if (!table) {
        return;
    }


    const [
        agents,
        banks
    ] = await Promise.all([

        getAgents(),

        getBanks()

    ]);


    let tbody =
        table.querySelector(
            "tbody"
        );


    if (!tbody) {

        tbody =
            document.createElement(
                "tbody"
            );

        table.appendChild(
            tbody
        );
    }


    /* =====================================================
       SEARCH FILTER
    ===================================================== */

    const search =
        String(
            performanceSearch || ""
        )
        .trim()
        .toLowerCase();


    let filteredAgents =
        agents;


    if (search) {

        filteredAgents =
            agents.filter(
                agent => {

                    const name =
                        String(
                            agent.name || ""
                        )
                        .toLowerCase();


                    const bank =
                        String(
                            agent.bank || ""
                        )
                        .toLowerCase();


                    const profile =
                        String(
                            agent.profile || ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        bank.includes(search) ||
                        profile.includes(search)
                    );

                }
            );
    }


    /* =====================================================
       NO RESULTS
    ===================================================== */

    if (!filteredAgents.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="20"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#777;
                    "
                >
                    No agents found.
                </td>
            </tr>
        `;

        return;
    }


    /* =====================================================
       RENDER ROWS
    ===================================================== */

    tbody.innerHTML =
        filteredAgents.map(
            agent => `

            <tr
                data-agent-id="${escapeHTML(
                    agent.id
                )}"
            >

                <td>

                    <input
                        class="agent-name"
                        value="${escapeHTML(
                            agent.name
                        )}"
                    >

                </td>


                <td>

                    <select
                        class="bank-select"
                    >

                        ${banks.map(
                            bank => `

                            <option
                                value="${escapeHTML(
                                    bank.bank
                                )}"
                                ${
                                    String(
                                        bank.bank
                                    ).toUpperCase() ===
                                    String(
                                        agent.bank
                                    ).toUpperCase()
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(
                                    bank.bank
                                )}
                            </option>

                        `
                        ).join("")}

                    </select>

                </td>

    <td
                    class="profile-photo-cell"
                >

                    ${
                        getPhoto(agent)
                        ?
                        `
                        <img
                            class="
                                profile-photo-preview
                            "
                            src="${getPhoto(
                                agent
                            )}"
                            alt="Agent"
                            style="
                                display:block;
                            "
                        >
                        `
                        :
                        `
                        <div
                            class="
                                profile-photo-placeholder
                            "
                        >
                            👤
                        </div>
                        `
                    }


                    <input
                        type="file"
                        accept="image/*"
                        class="profile-file"
                    >


                    <button
                        type="button"
                        class="
                            profile-upload-btn
                        "
                    >
                        Photo
                    </button>


                    <button
                        type="button"
                        class="
                            profile-remove-btn
                        "
                    >
                        Remove
                    </button>

                </td>

                <td>

                    <input
                        type="number"
                        class="talkActual"
                        value="${number(
                            agent.talk_actual
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="rpcActual"
                        value="${number(
                            agent.rpc_actual
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="nptpActual"
                        value="${number(
                            agent.nptp_actual
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="npayActual"
                        value="${number(
                            agent.npayment_actual
                        )}"
                    >

                </td>


                <td>

                    <input
                        class="messageInput"
                        value="${escapeHTML(
                            agent.message ||
                            "KEEP GOING! 💙"
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="color"
                        class="accent"
                        value="${
                            agent.accent ||
                            "#1478c9"
                        }"
                    >

                </td>


            

                <td>

                    <button
                        type="button"
                        class="btn save-agent"
                    >
                        Save
                    </button>


                    <button
                        type="button"
                        class="delete-btn delete-agent"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `
        ).join("");


    /* =====================================================
       ROW EVENTS
    ===================================================== */

    tbody
        .querySelectorAll(
            "tr[data-agent-id]"
        )
        .forEach(
            row => {

                const id =
                    row.dataset.agentId;


                const photoButton =
                    row.querySelector(
                        ".profile-upload-btn"
                    );


                const photoFile =
                    row.querySelector(
                        ".profile-file"
                    );


                photoButton?.addEventListener(
                    "click",
                    () => {

                        if (!adminOnly()) {
                            return;
                        }

                        photoFile?.click();

                    }
                );


                photoFile?.addEventListener(
                    "change",
                    async event => {

                        const file =
                            event.target
                                .files?.[0];


                        if (file) {

                            await saveAgentPhoto(
                                id,
                                file
                            );

                        }

                    }
                );


                row.querySelector(
                    ".profile-remove-btn"
                )?.addEventListener(
                    "click",
                    async () => {

                        await removeAgentPhoto(
                            id
                        );

                    }
                );


                row.querySelector(
                    ".save-agent"
                )?.addEventListener(
                    "click",
                    async () => {

                        if (!adminOnly()) {
                            return;
                        }


                        await updateAgent(
                            id,
                            {

                                name:
                                    row.querySelector(
                                        ".agent-name"
                                    ).value.trim(),


                                bank:
                                    row.querySelector(
                                        ".bank-select"
                                    ).value,


                                talk_actual:
                                    number(
                                        row.querySelector(
                                            ".talkActual"
                                        ).value
                                    ),


                                rpc_actual:
                                    number(
                                        row.querySelector(
                                            ".rpcActual"
                                        ).value
                                    ),


                                nptp_actual:
                                    number(
                                        row.querySelector(
                                            ".nptpActual"
                                        ).value
                                    ),


                                npayment_actual:
                                    number(
                                        row.querySelector(
                                            ".npayActual"
                                        ).value
                                    ),


                                message:
                                    row.querySelector(
                                        ".messageInput"
                                    ).value,


                                accent:
                                    row.querySelector(
                                        ".accent"
                                    ).value

                            }
                        );


                        await renderPerformanceTable();

                    }
                );


                row.querySelector(
                    ".delete-agent"
                )?.addEventListener(
                    "click",
                    async () => {

                        await deleteAgent(
                            id
                        );

                        await renderPerformanceTable();

                    }
                );

            }
        );
}

/* =========================================================
   BANK TABLE
========================================================= */

async function renderBankTable() {

    if (!isAdmin) {
        return;
    }


    const table =
        $("#bankTable");


    if (!table) {
        return;
    }


    const banks =
        await getBanks();


    let tbody =
        table.querySelector(
            "tbody"
        );


    if (!tbody) {

        tbody =
            document.createElement(
                "tbody"
            );

        table.appendChild(
            tbody
        );
    }


    tbody.innerHTML =
        banks.map(
            bank => `

            <tr
                data-bank-id="${escapeHTML(
                    bank.id
                )}"
            >

                <td>

                    <input
                        class="bank-name"
                        value="${escapeHTML(
                            bank.bank
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="talkTarget"
                        value="${number(
                            bank.talk_target
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="rpcTarget"
                        value="${number(
                            bank.rpc_target
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="nptpTarget"
                        value="${number(
                            bank.nptp_target
                        )}"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        class="paymentTarget"
                        value="${number(
                            bank.npayment_target
                        )}"
                    >

                </td>


                <td>

                    <button
                        type="button"
                        class="btn save-bank"
                    >
                        Save
                    </button>


                    <button
                        type="button"
                        class="delete-btn delete-bank"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `
        ).join("");


    tbody
        .querySelectorAll(
            "tr"
        )
        .forEach(
            row => {

                const id =
                    row.dataset.bankId;


                row.querySelector(
                    ".save-bank"
                )?.addEventListener(
                    "click",
                    async () => {

                        if (!adminOnly()) {
                            return;
                        }


                        await updateBank(
                            id,
                            {

                                bank:
                                    row.querySelector(
                                        ".bank-name"
                                    ).value.trim(),

                                talk_target:
                                    number(
                                        row.querySelector(
                                            ".talkTarget"
                                        ).value
                                    ),

                                rpc_target:
                                    number(
                                        row.querySelector(
                                            ".rpcTarget"
                                        ).value
                                    ),

                                nptp_target:
                                    number(
                                        row.querySelector(
                                            ".nptpTarget"
                                        ).value
                                    ),

                                npayment_target:
                                    number(
                                        row.querySelector(
                                            ".paymentTarget"
                                        ).value
                                    )
                            }
                        );


                        await renderBankTable();
                    }
                );


                row.querySelector(
                    ".delete-bank"
                )?.addEventListener(
                    "click",
                    async () => {

                        await deleteBank(
                            id
                        );

                        await renderBankTable();
                    }
                );
            }
        );
}
/* =========================================================
   PERFORMANCE TABLE SEARCH
========================================================= */

$("#agentSearch")?.addEventListener(
    "input",
    event => {

        performanceSearch =
            event.target.value;

        renderPerformanceTable();

    }
);

/* =========================================================
   ADD BUTTON
========================================================= */

$("#addBtn")?.addEventListener(
    "click",
    async event => {

        event.preventDefault();


        if (!adminOnly()) {
            return;
        }


        await addAgent({

            name:
                "New Agent",

            bank:
                "ENBD",

            talk_actual:
                0,

            rpc_actual:
                0,

            nptp_actual:
                0,

            npayment_actual:
                0,

            message:
                "KEEP GOING! 💙",

            accent:
                "#1478c9"

        });


        await renderPerformanceTable();
    }
);


/* =========================================================
   ADD BANK BUTTON
========================================================= */

$("#addBankBtn")?.addEventListener(
    "click",
    async event => {

        event.preventDefault();


        if (!adminOnly()) {
            return;
        }


        await addBank({

            bank:
                "NEW BANK",

            talk_target:
                0,

            rpc_target:
                0,

            nptp_target:
                0,

            npayment_target:
                0

        });


        await renderBankTable();
    }
);


/* =========================================================
   REFRESH BUTTON
========================================================= */

$("#refreshBtn")?.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        await refreshDashboard();

        if (isAdmin) {

            await renderPerformanceTable();

        }
    }
);


/* =========================================================
   REFRESH BANK BUTTON
========================================================= */

$("#refreshBankBtn")?.addEventListener(
    "click",
    async event => {

        event.preventDefault();


        if (!adminOnly()) {
            return;
        }


        banksCache = null;


        await renderBankArea(
            true
        );


        await renderBankTable();
    }
);


/* =========================================================
   START
========================================================= */

async function startApp() {

    try {

        showUserInfo();

        applyRoleAccess();


        const [
            agents,
            banks
        ] = await Promise.all([

            getAgents(),

            getBanks()

        ]);


        renderBankTabs(
    banks
);

renderMonthlyTargets(
    banks
);

await renderDashboard(
    false
);

// Leader bank rotation every 10 minutes
startAutoBankRotation(
    banks
);

        if (isAdmin) {

            await renderPerformanceTable();

            await renderBankTable();
        }


    } catch (error) {

        console.error(
            "APP START ERROR:",
            error
        );

        toast(
            "Unable to load dashboard."
        );
    }
}


startApp();
