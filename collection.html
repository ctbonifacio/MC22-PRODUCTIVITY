/* =========================================================
   MC22 COLLECTION / AMOUNTS
   LOCAL EXCEL / CSV READER

   IMPORTANT:
   - No Supabase
   - No database
   - No permanent storage
   - Data exists only while this page is open
========================================================= */


/* =========================================================
   CURRENT TAB
========================================================= */

let currentTab = "ptp";



/* =========================================================
   TEMPORARY DATA
========================================================= */

const uploadedData = {

    ptp: [],

    payments: [],

    remarks: [],

    inventory: []

};



/* =========================================================
   REQUIRED HEADERS
========================================================= */

const requiredHeaders = {


    /* =====================================================
       PTP
    ====================================================== */

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



    /* =====================================================
       PAYMENTS
    ====================================================== */

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



    /* =====================================================
       DAILY REMARKS
    ====================================================== */

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



    /* =====================================================
       MASTERLIST INVENTORY
    ====================================================== */

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
   DISPLAY HEADERS
========================================================= */

const displayHeaders = {

    ptp: requiredHeaders.ptp,

    payments: requiredHeaders.payments,

    remarks: requiredHeaders.remarks,

    inventory: requiredHeaders.inventory

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

const fileInput =
    document.getElementById("fileInput");


const uploadButton =
    document.getElementById("uploadButton");


const selectedFile =
    document.getElementById("selectedFile");


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


const clearDataButton =
    document.getElementById("clearDataButton");



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
   FIND COLUMN
========================================================= */

function findColumn(row, expectedHeader) {

    const target =
        normalizeHeader(expectedHeader);


    return Object.keys(row).find(
        key =>
            normalizeHeader(key) === target
    );

}



/* =========================================================
   ACCOUNT NUMBER HEADER
========================================================= */

function isAccountHeader(header) {

    const value =
        normalizeHeader(header);


    return (

        value === "ACCOUNT NUMBER" ||

        value ===
            "ACCOUNT NUMBER (IF UPLOAD, MASKED THE NUMBER)" ||

        value === "ACCOUNT NO" ||

        value === "ACCOUNT NO."

    );

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


    let account =
        String(value).trim();


    /*
       Remove spaces and dashes.
    */

    account =
        account.replace(
            /[\s-]/g,
            ""
        );


    /*
       Handle Excel scientific notation.
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
                Math.trunc(number)
                    .toString();

        }

    }


    /*
       Very short account.
    */

    if (account.length <= 4) {

        return "****";

    }


    /*
       5-8 characters.
    */

    if (account.length <= 8) {

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


    /*
       Normal account number.

       Example:

       1234567890123456

       becomes:

       1234********3456
    */

    const first =
        account.substring(0, 4);


    const last =
        account.substring(
            account.length - 4
        );


    const hidden =
        account.length - 8;


    return (

        first +

        "*".repeat(hidden) +

        last

    );

}



/* =========================================================
   BANK HEADER
========================================================= */

function isBankHeader(header) {

    return (
        normalizeHeader(header) === "BANK"
    );

}



/* =========================================================
   MONTH HEADER
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
            function () {


                /*
                   Remove active
                   from all tabs.
                */

                document
                    .querySelectorAll(
                        ".collection-tab"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                /*
                   Activate clicked tab.
                */

                this.classList.add(
                    "active"
                );


                /*
                   Change current tab.
                */

                currentTab =
                    this.dataset.tab;


                /*
                   Change title.
                */

                uploadTitle.textContent =
                    tabTitles[currentTab];


                /*
                   Reset controls.
                */

                fileInput.value = "";

                selectedFile.textContent =
                    "No file selected";

                searchInput.value = "";

                bankFilter.value = "";

                monthFilter.value = "";


                /*
                   Show that tab's data.
                */

                renderTable();

            }

        );

    });



/* =========================================================
   FILE SELECTION
========================================================= */

fileInput.addEventListener(
    "change",
    function () {


        if (this.files.length) {

            selectedFile.textContent =
                this.files[0].name;

        }
        else {

            selectedFile.textContent =
                "No file selected";

        }

    }
);



/* =========================================================
   UPLOAD BUTTON
========================================================= */

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



/* =========================================================
   READ EXCEL / CSV
========================================================= */

function readExcelFile(file) {


    const reader =
        new FileReader();


    reader.onload =
        function (event) {


            try {


                /*
                   Convert file
                   to binary array.
                */

                const data =
                    new Uint8Array(
                        event.target.result
                    );


                /*
                   Read workbook.
                */

                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );


                /*
                   Make sure sheet exists.
                */

                if (
                    !workbook.SheetNames.length
                ) {

                    alert(
                        "No worksheet was found."
                    );

                    return;

                }


                /*
                   Use first worksheet.
                */

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];


                /*
                   Convert worksheet
                   into objects.
                */

                const rows =
                    XLSX.utils.sheet_to_json(
                        firstSheet,
                        {
                            defval: "",
                            raw: false
                        }
                    );


                /*
                   Empty file.
                */

                if (!rows.length) {

                    alert(
                        "The uploaded file contains no records."
                    );

                    return;

                }


                /*
                   Store ONLY in memory.

                   No database.
                   No Supabase.
                   No localStorage.
                */

                uploadedData[currentTab] =
                    rows;


                /*
                   Display.
                */

                renderTable();


            }
            catch (error) {


                console.error(
                    "Excel reader error:",
                    error
                );


                alert(
                    "Unable to read this file. Please check that it is a valid Excel or CSV file."
                );

            }

        };


    reader.readAsArrayBuffer(file);

}



/* =========================================================
   FILTER DATA
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


        /* =================================================
           SEARCH
        ================================================== */

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



        /* =================================================
           BANK
        ================================================== */

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



        /* =================================================
           MONTH
        ================================================== */

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


    const rows =
        getFilteredData();


    const headers =
        displayHeaders[currentTab];


    /*
       Clear existing table.
    */

    tableHead.innerHTML = "";

    tableBody.innerHTML = "";



    /* =====================================================
       HEADER
    ====================================================== */

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



    /* =====================================================
       DATA
    ====================================================== */

    rows.forEach(row => {


        const tr =
            document.createElement("tr");


        headers.forEach(header => {


            const td =
                document.createElement("td");


            /*
               Find matching uploaded
               column.
            */

            const actualKey =
                findColumn(
                    row,
                    header
                );


            let value =
                actualKey !== undefined
                    ? row[actualKey]
                    : "";



            /*
               MASK ACCOUNT NUMBER
               IN ALL FOUR TABS.
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
               Display blank instead
               of null/undefined.
            */

            if (
                value === null ||
                value === undefined
            ) {

                value = "";

            }


            td.textContent =
                value;


            tr.appendChild(td);

        });


        tableBody.appendChild(tr);

    });



    /* =====================================================
       RECORD COUNT
    ====================================================== */

    recordCount.textContent =
        rows.length.toLocaleString();



    /* =====================================================
       EMPTY MESSAGE
    ====================================================== */

    emptyMessage.style.display =
        rows.length
            ? "none"
            : "block";

}



/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    renderTable
);



/* =========================================================
   BANK FILTER
========================================================= */

bankFilter.addEventListener(
    "change",
    renderTable
);



/* =========================================================
   MONTH FILTER
========================================================= */

monthFilter.addEventListener(
    "change",
    renderTable
);



/* =========================================================
   CLEAR CURRENT TAB
========================================================= */

clearDataButton.addEventListener(
    "click",
    function () {


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


        /*
           Delete only the
           current tab's data.
        */

        uploadedData[currentTab] =
            [];


        fileInput.value = "";

        selectedFile.textContent =
            "No file selected";


        renderTable();

    }
);



/* =========================================================
   INITIAL TABLE
========================================================= */

renderTable();
