/* =========================================================
   MC22 COLLECTION / AMOUNTS
========================================================= */

let currentTab = "dashboard";

let uploadedData = {
    ptp: [],
    payments: [],
    remarks: [],
    inventory: []
};


/* =========================================================
   HEADERS
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
   TAB TITLES
========================================================= */

const tabTitles = {

    ptp: "PTP LIST",

    payments: "PAYMENTS LIST",

    remarks: "DAILY REMARKS",

    inventory: "MASTERLIST INVENTORY"

};


/* =========================================================
   ELEMENTS
========================================================= */

const dashboardPage =
    document.getElementById("dashboardPage");

const dataPage =
    document.getElementById("dataPage");

const dataTitle =
    document.getElementById("dataTitle");

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


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".collection-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".collection-tab")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });

                this.classList.add("active");

                currentTab =
                    this.dataset.tab;


                if (
                    currentTab === "dashboard"
                ) {

                    dashboardPage.style.display =
                        "block";

                    dataPage.style.display =
                        "none";

                    return;

                }


                dashboardPage.style.display =
                    "none";

                dataPage.style.display =
                    "block";


                dataTitle.textContent =
                    tabTitles[currentTab];


                if (searchInput) {
                    searchInput.value = "";
                }

                if (bankFilter) {
                    bankFilter.value = "";
                }

                if (monthFilter) {
                    monthFilter.value = "";
                }

                if (fileInput) {
                    fileInput.value = "";
                }

                renderTable();

            }
        );

    });


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

    let account =
        String(value)
            .trim()
            .replace(/[\s-]/g, "");


    /*
       Excel scientific notation
    */

    if (
        account.includes("E+") ||
        account.includes("e+")
    ) {

        const number =
            Number(account);

        if (Number.isFinite(number)) {

            try {

                account =
                    BigInt(
                        Math.round(number)
                    ).toString();

            } catch (error) {

                account =
                    String(number);

            }

        }

    }


    if (account.length <= 4) {

        return "****";

    }


    if (account.length <= 8) {

        return (
            account.substring(0, 2) +
            "*".repeat(
                account.length - 4
            ) +
            account.substring(
                account.length - 2
            )
        );

    }


    return (
        account.substring(0, 4) +
        "*".repeat(
            account.length - 8
        ) +
        account.substring(
            account.length - 4
        )
    );

}


/* =========================================================
   HEADER NORMALIZATION
========================================================= */

function normalizeHeader(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

}


function isAccountHeader(header) {

    const value =
        normalizeHeader(header);

    return (
        value === "ACCOUNT NUMBER" ||
        value === "ACCOUNT NO" ||
        value === "ACCOUNT NO."
    );

}


function isBankHeader(header) {

    return (
        normalizeHeader(header) === "BANK"
    );

}


function isMonthHeader(header) {

    const value =
        normalizeHeader(header);

    return (
        value === "MONTH" ||
        value === "ACTIVE MONTH"
    );

}


/* =========================================================
   UPLOAD
========================================================= */

if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        function () {

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

}


/* =========================================================
   READ EXCEL
========================================================= */

function readExcelFile(file) {

    const reader =
        new FileReader();


    reader.onload =
        function (event) {

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


                const sheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                const rows =
                    XLSX.utils.sheet_to_json(
                        sheet,
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


                alert(
                    `${rows.length.toLocaleString()} records loaded successfully.`
                );

            }

            catch (error) {

                console.error(error);

                alert(
                    "Unable to read the Excel/CSV file."
                );

            }

        };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredData() {

    const data =
        uploadedData[currentTab] || [];


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const bank =
        bankFilter
            ? bankFilter.value
                .trim()
                .toLowerCase()
            : "";


    const month =
        monthFilter
            ? monthFilter.value
                .trim()
                .toLowerCase()
            : "";


    return data.filter(row => {


        const values =
            Object.values(row)
                .map(value =>
                    String(value)
                        .toLowerCase()
                );


        const matchesSearch =
            !search ||
            values.some(
                value =>
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


            if (bankKey) {

                matchesBank =
                    String(
                        row[bankKey] || ""
                    )
                    .toLowerCase()
                    .includes(bank);

            }

        }


        let matchesMonth = true;


        if (month) {

            const monthKey =
                Object.keys(row)
                    .find(
                        key =>
                            isMonthHeader(key)
                    );


            if (monthKey) {

                matchesMonth =
                    String(
                        row[monthKey] || ""
                    )
                    .toLowerCase()
                    .includes(month);

            }

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

    if (
        currentTab === "dashboard"
    ) {
        return;
    }


    const rows =
        getFilteredData();


    const headers =
        requiredHeaders[currentTab];


    tableHead.innerHTML = "";

    tableBody.innerHTML = "";


    /*
       HEADERS
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
       ROWS
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
               MASK ACCOUNT NUMBERS
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
               DATE
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
   FILTER EVENTS
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTable
    );

}


if (bankFilter) {

    bankFilter.addEventListener(
        "change",
        renderTable
    );

}


if (monthFilter) {

    monthFilter.addEventListener(
        "change",
        renderTable
    );

}


/* =========================================================
   CLEAR
========================================================= */

const clearButton =
    document.getElementById(
        "clearDataButton"
    );


if (clearButton) {

    clearButton.addEventListener(
        "click",
        function () {

            if (
                currentTab === "dashboard"
            ) {
                return;
            }


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


            if (fileInput) {
                fileInput.value = "";
            }


            renderTable();

        }
    );

}


/* =========================================================
   MONTH NAV
========================================================= */

const monthSelect =
    document.getElementById(
        "monthSelect"
    );


const distributionMonth =
    document.getElementById(
        "distributionMonth"
    );


if (monthSelect) {

    monthSelect.addEventListener(
        "change",
        function () {

            if (distributionMonth) {

                distributionMonth.textContent =
                    this.value;

            }

        }
    );

}
