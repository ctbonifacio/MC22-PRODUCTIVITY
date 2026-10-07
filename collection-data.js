/* =========================================================
   MC22 PERFORMANCE
   COLLECTION DATA / EXCEL READER

   NO SUPABASE
   NO DATABASE
   NO DATA STORAGE

   Reads Excel workbook directly in browser.
========================================================= */


/* =========================================================
   DATA
========================================================= */

let workbookData = {

    "PTP": [],

    "PAYMENTS": [],

    "DAILY REMARKS": [],

    "MASTERLIST INVENTORY": []

};


let currentSheet = "PTP";


/* =========================================================
   REQUIRED SHEETS
========================================================= */

const requiredSheets = [

    "PTP",

    "PAYMENTS",

    "DAILY REMARKS",

    "MASTERLIST INVENTORY"

];


/* =========================================================
   REQUIRED HEADERS
========================================================= */

const requiredHeaders = {

    "PTP": [

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


    "PAYMENTS": [

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


    "DAILY REMARKS": [

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


    "MASTERLIST INVENTORY": [

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
   ELEMENTS
========================================================= */

const excelFile =
    document.getElementById(
        "excelFile"
    );


const fileName =
    document.getElementById(
        "fileName"
    );


const uploadButton =
    document.getElementById(
        "uploadButton"
    );


const statusMessage =
    document.getElementById(
        "statusMessage"
    );


const sheetStatus =
    document.getElementById(
        "sheetStatus"
    );


const previewSection =
    document.getElementById(
        "previewSection"
    );


const previewSubtitle =
    document.getElementById(
        "previewSubtitle"
    );


const previewCount =
    document.getElementById(
        "previewCount"
    );


const tableHead =
    document.getElementById(
        "tableHead"
    );


const tableBody =
    document.getElementById(
        "tableBody"
    );


const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );


/* =========================================================
   FILE NAME
========================================================= */

excelFile.addEventListener(
    "change",
    function () {

        const file =
            excelFile.files[0];


        if (!file) {

            fileName.textContent =
                "No file selected";

            return;

        }


        fileName.textContent =
            file.name;

    }
);


/* =========================================================
   UPLOAD
========================================================= */

uploadButton.addEventListener(
    "click",
    function () {

        const file =
            excelFile.files[0];


        if (!file) {

            showStatus(
                "Please choose an Excel file first.",
                "error"
            );

            return;

        }


        readExcel(file);

    }
);


/* =========================================================
   READ EXCEL
========================================================= */

function readExcel(file) {

    showStatus(
        "Reading Excel workbook...",
        "success"
    );


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


                processWorkbook(
                    workbook
                );

            }

            catch (error) {

                console.error(
                    "Excel error:",
                    error
                );


                showStatus(
                    "Unable to read the Excel file. Please make sure it is a valid .xlsx or .xls workbook.",
                    "error"
                );

            }

        };


    reader.readAsArrayBuffer(
        file
    );

}


/* =========================================================
   PROCESS WORKBOOK
========================================================= */

function processWorkbook(workbook) {

    /*
       Reset old data
    */

    workbookData = {

        "PTP": [],

        "PAYMENTS": [],

        "DAILY REMARKS": [],

        "MASTERLIST INVENTORY": []

    };


    /*
       Match sheets without requiring
       exact capitalization.
    */

    const actualSheets =
        workbook.SheetNames;


    const missingSheets = [];


    requiredSheets.forEach(
        requiredSheet => {

            const actualSheet =
                actualSheets.find(
                    sheet =>
                        normalizeSheetName(sheet) ===
                        normalizeSheetName(requiredSheet)
                );


            if (!actualSheet) {

                missingSheets.push(
                    requiredSheet
                );

                return;

            }


            const worksheet =
                workbook.Sheets[
                    actualSheet
                ];


            const rows =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: "",
                        raw: true
                    }
                );


            workbookData[
                requiredSheet
            ] = rows;

        }
    );


    updateSheetStatus();


    /*
       Show missing sheet warning
    */

    if (missingSheets.length) {

        showStatus(
            "Workbook loaded, but these sheets were not found: " +
            missingSheets.join(", "),
            "error"
        );

    }

    else {

        showStatus(
            "Excel workbook uploaded successfully. All 4 sheets were found.",
            "success"
        );

    }


    /*
       Show preview
    */

    sheetStatus.classList.remove(
        "hidden"
    );


    previewSection.classList.remove(
        "hidden"
    );


    currentSheet = "PTP";


    updateSheetButtons();


    renderTable();

}


/* =========================================================
   NORMALIZE SHEET NAME
========================================================= */

function normalizeSheetName(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

}


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
   UPDATE SHEET STATUS
========================================================= */

function updateSheetStatus() {

    updateStatusBox(
        "statusPTP",
        "PTP"
    );


    updateStatusBox(
        "statusPayments",
        "PAYMENTS"
    );


    updateStatusBox(
        "statusRemarks",
        "DAILY REMARKS"
    );


    updateStatusBox(
        "statusInventory",
        "MASTERLIST INVENTORY"
    );

}


/* =========================================================
   STATUS BOX
========================================================= */

function updateStatusBox(
    elementId,
    sheetName
) {

    const box =
        document.getElementById(
            elementId
        );


    if (!box) {
        return;
    }


    const rows =
        workbookData[sheetName] ||
        [];


    const records =
        box.querySelector(
            ".sheet-records"
        );


    if (rows.length) {

        box.classList.add(
            "loaded"
        );


        records.textContent =
            rows.length.toLocaleString() +
            " records loaded";

    }

    else {

        box.classList.remove(
            "loaded"
        );


        records.textContent =
            "0 records";

    }

}


/* =========================================================
   SHEET TABS
========================================================= */

document
    .querySelectorAll(".sheet-tab")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    currentSheet =
                        this.dataset.sheet;


                    updateSheetButtons();


                    renderTable();

                }
            );

        }
    );


/* =========================================================
   UPDATE ACTIVE TAB
========================================================= */

function updateSheetButtons() {

    document
        .querySelectorAll(
            ".sheet-tab"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sheet ===
                    currentSheet
                );

            }
        );

}


/* =========================================================
   ACCOUNT NUMBER HEADER
========================================================= */

function isAccountNumberHeader(
    header
) {

    const value =
        normalizeHeader(
            header
        );


    return (

        value ===
        "ACCOUNT NUMBER"

        ||

        value ===
        "ACCOUNT NO"

        ||

        value ===
        "ACCOUNT NO."

        ||

        value.includes(
            "ACCOUNT NUMBER"
        )

    );

}


/* =========================================================
   MASK ACCOUNT NUMBER
========================================================= */

function maskAccountNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    let account =
        String(value)
            .trim();


    /*
       Remove .0 from Excel
       numeric values.
    */

    if (
        /^\d+\.0$/.test(
            account
        )
    ) {

        account =
            account.substring(
                0,
                account.length - 2
            );

    }


    /*
       Scientific notation.
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

            try {

                account =
                    BigInt(
                        Math.round(number)
                    ).toString();

            }

            catch {

                account =
                    String(number);

            }

        }

    }


    /*
       Remove spaces/dashes.
    */

    account =
        account.replace(
            /[\s-]/g,
            ""
        );


    /*
       Mask.

       Example:

       123456789012
       ↓
       1234****9012
    */

    if (
        account.length <= 8
    ) {

        if (
            account.length <= 4
        ) {

            return "****";

        }


        return (

            account.substring(
                0,
                2
            )

            +

            "*".repeat(
                account.length - 4
            )

            +

            account.substring(
                account.length - 2
            )

        );

    }


    const first =
        account.substring(
            0,
            4
        );


    const last =
        account.substring(
            account.length - 4
        );


    const stars =
        "*".repeat(
            account.length - 8
        );


    return (
        first +
        stars +
        last
    );

}


/* =========================================================
   FIND ACTUAL COLUMN
========================================================= */

function findActualKey(
    row,
    header
) {

    const target =
        normalizeHeader(
            header
        );


    return Object.keys(row)
        .find(
            key =>
                normalizeHeader(key) ===
                target
        );

}


/* =========================================================
   FORMAT VALUE
========================================================= */

function formatValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (
        value instanceof Date
    ) {

        return value.toLocaleDateString();

    }


    return String(value);

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    const rows =
        workbookData[currentSheet] ||
        [];


    tableHead.innerHTML = "";

    tableBody.innerHTML = "";


    const headers =
        requiredHeaders[
            currentSheet
        ] || [];


    /*
       No data
    */

    if (!rows.length) {

        previewSubtitle.textContent =
            currentSheet +
            " — No records available";


        previewCount.textContent =
            "0 RECORDS";


        emptyMessage.style.display =
            "block";


        return;

    }


    previewSubtitle.textContent =
        currentSheet +
        " — Preview";


    previewCount.textContent =
        rows.length.toLocaleString() +
        " RECORDS";


    emptyMessage.style.display =
        "none";


    /*
       Header
    */

    const headerRow =
        document.createElement(
            "tr"
        );


    headers.forEach(
        header => {

            const th =
                document.createElement(
                    "th"
                );


            th.textContent =
                header;


            headerRow.appendChild(
                th
            );

        }
    );


    tableHead.appendChild(
        headerRow
    );


    /*
       Rows

       Limit preview to 500 rows
       to keep browser fast.
    */

    const previewRows =
        rows.slice(
            0,
            500
        );


    previewRows.forEach(
        row => {

            const tr =
                document.createElement(
                    "tr"
                );


            headers.forEach(
                header => {

                    const td =
                        document.createElement(
                            "td"
                        );


                    const actualKey =
                        findActualKey(
                            row,
                            header
                        );


                    let value =
                        actualKey
                            ? row[actualKey]
                            : "";


                    /*
                       MASK ACCOUNT NUMBER
                    */

                    if (
                        isAccountNumberHeader(
                            header
                        )
                    ) {

                        value =
                            maskAccountNumber(
                                value
                            );

                    }

                    else {

                        value =
                            formatValue(
                                value
                            );

                    }


                    td.textContent =
                        value;


                    tr.appendChild(
                        td
                    );

                }
            );


            tableBody.appendChild(
                tr
            );

        }
    );


    /*
       Preview notice
    */

    if (
        rows.length > 500
    ) {

        previewSubtitle.textContent =
            currentSheet +
            " — Showing first 500 of " +
            rows.length.toLocaleString() +
            " records";

    }

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(
    message,
    type
) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        "status-message " +
        type;

}


/* =========================================================
   MONTH SELECTOR
========================================================= */

const monthSelect =
    document.getElementById(
        "monthSelect"
    );


monthSelect.addEventListener(
    "change",
    function () {

        /*
           For now this only keeps
           the selected month in the UI.

           Later we can connect this
           to your Excel conditions.
        */

        localStorage.setItem(
            "mc22_collection_month",
            this.value
        );

    }
);
/* =========================================================
   RESTORE MONTH
========================================================= */

const savedMonth =
    localStorage.getItem(
        "mc22_collection_month"
    );


if (savedMonth) {

    monthSelect.value =
        savedMonth;

}
