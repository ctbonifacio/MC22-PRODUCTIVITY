const BANK_STORAGE = "mc22_banks";


function getBanks() {

    return JSON.parse(
        localStorage.getItem(BANK_STORAGE) || "[]"
    );

}


function saveBanks(banks) {

    localStorage.setItem(
        BANK_STORAGE,
        JSON.stringify(banks)
    );

}


function toast(message) {

    const t =
        document.querySelector("#toast");

    if (!t) {

        alert(message);

        return;
    }

    t.textContent =
        message;

    t.classList.add("show");

    setTimeout(() => {

        t.classList.remove("show");

    }, 2500);

}


/* =========================================
   DEFAULT BANK
========================================= */

function createDefaultBank() {

    const banks =
        getBanks();

    if (banks.length > 0) {
        return;
    }

    banks.push({

        id: Date.now().toString(),

        name: "ENBD",

        talkTarget: 670,

        rpcTarget: 33,

        ptpTarget: 44,

        paymentTarget: 22

    });

    saveBanks(banks);

}


/* =========================================
   RENDER
========================================= */

function renderBanks() {

    const body =
        document.querySelector(
            "#bankTable tbody"
        );

    if (!body) {
        return;
    }


    body.innerHTML = "";


    const banks =
        getBanks();


    banks.forEach(bank => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <input
                    class="bank-name"
                    value="${escapeHTML(bank.name)}"
                >

            </td>


            <td>

                <input
                    class="bank-talk"
                    type="number"
                    min="0"
                    value="${bank.talkTarget}"
                >

            </td>


            <td>

                <input
                    class="bank-rpc"
                    type="number"
                    min="0"
                    value="${bank.rpcTarget}"
                >

            </td>


            <td>

                <input
                    class="bank-ptp"
                    type="number"
                    min="0"
                    value="${bank.ptpTarget}"
                >

            </td>


            <td>

                <input
                    class="bank-payment"
                    type="number"
                    min="0"
                    value="${bank.paymentTarget}"
                >

            </td>


            <td>

                <button
                    class="btn save-bank">
                    Save
                </button>

                <button
                    class="delete-btn delete-bank">
                    Delete
                </button>

            </td>

        `;


        /* SAVE */

        row.querySelector(
            ".save-bank"
        ).addEventListener(
            "click",
            () => {

                const name =
                    row.querySelector(
                        ".bank-name"
                    ).value.trim();


                if (!name) {

                    alert(
                        "Please enter a bank name."
                    );

                    return;
                }


                bank.name =
                    name;

                bank.talkTarget =
                    Number(
                        row.querySelector(
                            ".bank-talk"
                        ).value
                    ) || 0;

                bank.rpcTarget =
                    Number(
                        row.querySelector(
                            ".bank-rpc"
                        ).value
                    ) || 0;

                bank.ptpTarget =
                    Number(
                        row.querySelector(
                            ".bank-ptp"
                        ).value
                    ) || 0;

                bank.paymentTarget =
                    Number(
                        row.querySelector(
                            ".bank-payment"
                        ).value
                    ) || 0;


                saveBanks(banks);

                toast(
                    "Bank targets saved."
                );

            }
        );


        /* DELETE */

        row.querySelector(
            ".delete-bank"
        ).addEventListener(
            "click",
            () => {

                if (
                    !confirm(
                        `Delete ${bank.name}?`
                    )
                ) {
                    return;
                }


                const updated =
                    banks.filter(
                        b =>
                            b.id !==
                            bank.id
                    );


                saveBanks(updated);

                renderBanks();

                toast(
                    "Bank deleted."
                );

            }
        );


        body.appendChild(row);

    });

}


/* =========================================
   ADD BANK
========================================= */

document
    .querySelector("#addBankBtn")
    ?.addEventListener(
        "click",
        () => {

            const banks =
                getBanks();


            banks.push({

                id:
                    Date.now().toString(),

                name:
                    "New Bank",

                talkTarget:
                    0,

                rpcTarget:
                    0,

                ptpTarget:
                    0,

                paymentTarget:
                    0

            });


            saveBanks(banks);

            renderBanks();

            toast(
                "New bank added."
            );

        }
    );


/* =========================================
   REFRESH
========================================= */

document
    .querySelector("#refreshBankBtn")
    ?.addEventListener(
        "click",
        () => {

            renderBanks();

            toast(
                "Bank targets refreshed."
            );

        }
    );


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

}


/* =========================================
   START
========================================= */

createDefaultBank();

renderBanks();
