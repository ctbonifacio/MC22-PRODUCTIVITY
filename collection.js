/* =========================================================
   MC22 COLLECTION / AMOUNTS
   EXCEL / CSV UPLOAD
========================================================= */

let currentTab = "ptp";

let uploadedData = {
    ptp: [],
    payments: [],
    remarks: [],
    inventory: []
};


/* =========================================================
   REQUIRED HEADERS
========================================================= */

const requiredHeaders = {

    ptp: [
        "Agent",
        "CH Code",
        "Customer Name",
        "Account Number",
        "PTP AMOUNT",
        "PTP DATE",
        "ResultDate",
        "Bank",
        "CODE",
        "VINTAGE",
        "Placement",
        "ACCOUNT STATUS",
        "STATUS CODE",
        "PTP TYPE",
        "CALL",
        "MONTH",
        "YEAR",
        "TYPE OF PAYMENT"
    ],

    payments: [
        "Agent",
        "Customer Name",
        "Account Number",
        "Status",
        "DISPO DATE",
        "Bank",
        "CODE",
        "PAYMENT AMOUNT",
        "DATE OF PAYMENT",
        "ACCOUNT STATUS",
        "PTP TYPE",
        "Placement",
        "Month",
        "Year"
    ],

    remarks: [
        "Agent",
        "Customer Name",
        "Account Number",
        "DISPO DATE",
        "Bank",
        "PLACEMENT",
        "VINTAGE",
        "STATUS CODE",
        "Remark",
        "PRODUCT",
        "ACCOUNT STATUS",
        "Status",
        "PHONE NUMBER",
        "PAYMENT AMOUNT",
        "DATE OF PAYMENT",
        "PTP AMOUNT",
        "PTP DATE"
    ],

    inventory: [
        "ACCOUNT NUMBER",
        "PLACEMENT",
        "CUSTOMER NAME",
        "Bank",
        "START DISPO",
        "START DATE",
        "PULL OUT DATE",
        "DATE RANGE",
        "Agent",
        "RPC",
        "PTP",
        "PAYMENT",
        "ACTIVE MONTH"
    ]

};


/* =========================================================
   TABLE HEADERS
========================================================= */

const displayHeaders = {

    ptp: requiredHeaders.ptp,

    payments: requiredHeaders.payments,

    remarks: requiredHeaders.remarks,

    inventory: requiredHeaders.inventory

};


/* =========================================================
   ELEMENTS
========================================================= */

const fileInput =
    document.getElementById("fileInput");

const uploadButton =
    document.getElementById("uploadButton");

const tableHead =
    document.getElementById("tableHead");

const tableBody =
    document.getElementById("tableBody");

const emptyMessage =
    document.getElementById("emptyMessage");

const recordCount =
    document.getElementById("recordCount");

const searchInput =
    document.getElementById("searchInput");

const bankFilter =
    document.getElementById("bankFilter");

const monthFilter =
    document.getElementById("monthFilter");

const uploadTitle =
    document.getElementById("uploadTitle");


/* =========================================================
   TAB NAMES
========================================================= */

const tabTitles = {

    ptp: "PTP LIST",

    payments: "PAYMENTS LIST",

    remarks: "DAILY REMARKS",

    inventory: "MASTERLIST INVENTORY"

};


/* =========================================================
   NORMALIZE HEADER
========================================================= */

function normalizeHeader(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

}


/* =========================================================
   MASK ACCOUNT NUMBER
========================================================= */

function maskAccountNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    let account = String(value)
        .trim();

    /*
       Remove Excel scientific notation
       only when it is clearly numeric.
    */

    if (
        account.includes("E+") ||
        account.includes("e+")
    ) {

        const number =
            Number(account);

        if (
            Number.isFinite(number)
        ) {

            account =
                BigInt(
                    Math.round(number)
                ).toString();

        }

    }

    /*
       Remove spaces and dashes.
    */

    account =
        account.replace(
            /[\s-]/g,
            ""
        );

    /*
       Keep first 4 and last 4.
    */

    if (account.length <= 8) {

        if (account.length <= 4) {
            return "****";
        }

        return (
            account.substring(0, 2) +
            "*".repeat(
                Math.max(
                    1,
                    account.length - 4
                )
            ) +
            account.substring(
                account.length - 2
            )
        );

    }

    const first =
        account.substring(0, 4);

    const last =
        account.substring(
            account.length - 4
        );

    const middleLength =
        account.length - 8;

    return (
        first +
        "*".repeat(middleLength) +
        last
    );

}


/* =========================================================
   FIND ACCOUNT COLUMN
========================================================= */

function isAccountHeader(header) {

    const normalized =
        normalizeHeader(header);

    return (
        normalized === "ACCOUNT NUMBER" ||
        normalized === "ACCOUNT NUMBER (IF UPLOAD, MASKED THE NUMBER)" ||
        normalized === "ACCOUNT NO" ||
        normalized === "ACCOUNT NO."
    );

}


/* =========================================================
   FIND BANK COLUMN
========================================================= */

function isBankHeader(header) {

    return (
        normalizeHeader(header) === "BANK"
    );

}


/* =========================================================
   FIND MONTH COLUMN
========================================================= */

function isMonthHeader(header) {

    const value =
        normalizeHeader(header);

    return (
        value === "MONTH" ||
        value === "ACTIVE MONTH"
    );

}


/* =========================================================
   CHANGE TAB
========================================================= */

document
    .querySelectorAll(".collection-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".collection-tab"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );

                currentTab =
                    button.dataset.tab;

                uploadTitle.textContent =
                    tabTitles[currentTab];

                fileInput.value = "";

                searchInput.value = "";

                bankFilter.value = "";

                monthFilter.value = "";

                renderTable();

            }
        );

    });


/* =========================================================
   READ FILE
========================================================= */

uploadButton.addEventListener(
    "click",
    () => {

        const file =
            fileInput.files[0];

        if (!file) {

            alert(
                "Please choose an Excel or CSV file first."
            );

            return;

        }

        readExcelFile(file);

    }
);


/* =========================================================
   EXCEL / CSV READER
========================================================= */

function readExcelFile(file) {

    const reader =
        new FileReader();

    reader.onload =
        function(event) {

            try {

                const data =
                    new Uint8Array(
                        event.target.result
                    );

                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(
                        firstSheet,
                        {
                            defval: ""
                        }
                    );

                if (!rows.length) {

                    alert(
                        "The uploaded file contains no records."
                    );

                    return;

                }

                uploadedData[currentTab] =
                    rows;

                renderTable();

            }

            catch(error) {

                console.error(error);

                alert(
                    "Unable to read the file. Please check that it is a valid Excel or CSV file."
                );

            }

        };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   GET FILTERED DATA
========================================================= */

function getFilteredData() {

    const data =
        uploadedData[currentTab] || [];

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const bank =
        bankFilter.value
            .trim()
            .toLowerCase();

    const month =
        monthFilter.value
            .trim()
            .toLowerCase();


    return data.filter(row => {

        const values =
            Object.values(row)
                .map(value =>
                    String(value)
                        .toLowerCase()
                );

        const matchesSearch =
            !search ||
            values.some(value =>
                value.includes(search)
            );


        let matchesBank = true;

        if (bank) {

            const bankKey =
                Object.keys(row)
                    .find(
                        key =>
                            isBankHeader(key)
                    );

            matchesBank =
                bankKey
                    ? String(
                        row[bankKey] || ""
                    )
                    .toLowerCase()
                    .includes(bank)
                    : true;

        }


        let matchesMonth = true;

        if (month) {

            const monthKey =
                Object.keys(row)
                    .find(
                        key =>
                            isMonthHeader(key)
                    );

            matchesMonth =
                monthKey
                    ? String(
                        row[monthKey] || ""
                    )
                    .toLowerCase()
                    .includes(month)
                    : true;

        }


        return (
            matchesSearch &&
            matchesBank &&
            matchesMonth
        );

    });

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    const rows =
        getFilteredData();

    const headers =
        displayHeaders[currentTab];


    tableHead.innerHTML = "";

    tableBody.innerHTML = "";


    /*
       HEADER
    */

    const headerRow =
        document.createElement("tr");

    headers.forEach(header => {

        const th =
            document.createElement("th");

        th.textContent =
            header;

        headerRow.appendChild(th);

    });

    tableHead.appendChild(
        headerRow
    );


    /*
       DATA
    */

    rows.forEach(row => {

        const tr =
            document.createElement("tr");


        headers.forEach(header => {

            const td =
                document.createElement("td");

            const actualKey =
                Object.keys(row)
                    .find(
                        key =>
                            normalizeHeader(key) ===
                            normalizeHeader(header)
                    );


            let value =
                actualKey
                    ? row[actualKey]
                    : "";


            /*
               MASK ALL ACCOUNT NUMBERS
            */

            if (
                isAccountHeader(header)
            ) {

                value =
                    maskAccountNumber(
                        value
                    );

            }


            /*
               Keep Excel dates readable
            */

            if (
                value instanceof Date
            ) {

                value =
                    value.toLocaleDateString();

            }


            td.textContent =
                value === null ||
                value === undefined
                    ? ""
                    : value;

            tr.appendChild(td);

        });


        tableBody.appendChild(tr);

    });


    recordCount.textContent =
        rows.length.toLocaleString();


    emptyMessage.style.display =
        rows.length
            ? "none"
            : "block";

}


/* =========================================================
   SEARCH / FILTER EVENTS
========================================================= */

searchInput.addEventListener(
    "input",
    renderTable
);

bankFilter.addEventListener(
    "change",
    renderTable
);

monthFilter.addEventListener(
    "change",
    renderTable
);


/* =========================================================
   CLEAR CURRENT TAB
========================================================= */

document
    .getElementById("clearDataButton")
    .addEventListener(
        "click",
        () => {

            if (
                !uploadedData[currentTab].length
            ) {

                return;

            }


            const confirmed =
                confirm(
                    `Clear all ${tabTitles[currentTab]} data?`
                );


            if (!confirmed) {
                return;
            }


            uploadedData[currentTab] =
                [];

            fileInput.value = "";

            renderTable();

        }
    );


/* =========================================================
   INITIAL TABLE
========================================================= */

renderTable();
