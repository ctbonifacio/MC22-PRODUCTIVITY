/* =========================================================
   MC22 COLLECTION / AMOUNTS
   EXCEL WORKBOOK READER
========================================================= */


/* =========================================================
   STORAGE
   NO SUPABASE
   NO DATABASE
========================================================= */

let collectionWorkbook = null;

let collectionData = {

    ptp: [],

    payments: [],

    remarks: [],

    inventory: []

};


/* =========================================================
   REQUIRED SHEETS
========================================================= */

const requiredSheets = {

    ptp: [
        "PTP",
        "PTP LIST"
    ],

    payments: [
        "PAYMENTS",
        "PAYMENT",
        "PAYMENTS LIST"
    ],

    remarks: [
        "DAILY REMARKS",
        "DAILY REMARK",
        "REMARKS"
    ],

    inventory: [
        "MASTERLIST INVENTORY",
        "MASTERLIST",
        "INVENTORY"
    ]

};


/* =========================================================
   ELEMENTS
========================================================= */

const excelFile =
    document.getElementById(
        "excelFile"
    );

const selectedFile =
    document.getElementById(
        "selectedFile"
    );

const uploadExcelButton =
    document.getElementById(
        "uploadExcelButton"
    );

const excelStatus =
    document.getElementById(
        "excelStatus"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


/* =========================================================
   FILE SELECTED
========================================================= */

excelFile.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {

            selectedFile.textContent =
                "No file selected";

            return;

        }

        selectedFile.textContent =
            file.name;

    }
);


/* =========================================================
   UPLOAD BUTTON
========================================================= */

uploadExcelButton.addEventListener(
    "click",
    function () {

        const file =
            excelFile.files[0];

        if (!file) {

            alert(
                "Please choose an Excel file first."
            );

            return;

        }

        readWorkbook(file);

    }
);


/* =========================================================
   READ EXCEL WORKBOOK
========================================================= */

function readWorkbook(file) {

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


                collectionWorkbook =
                    workbook;


                processWorkbook(
                    workbook
                );


            }
            catch (error) {

                console.error(
                    "Excel error:",
                    error
                );

                showError(
                    "Unable to read this Excel file. Please make sure it is a valid .xlsx or .xls workbook."
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

    const sheets =
        workbook.SheetNames;


    console.log(
        "Workbook sheets:",
        sheets
    );


    const ptpSheet =
        findSheet(
            sheets,
            requiredSheets.ptp
        );


    const paymentsSheet =
        findSheet(
            sheets,
            requiredSheets.payments
        );


    const remarksSheet =
        findSheet(
            sheets,
            requiredSheets.remarks
        );


    const inventorySheet =
        findSheet(
            sheets,
            requiredSheets.inventory
        );


    let missing = [];


    if (!ptpSheet) {
        missing.push(
            "PTP"
        );
    }

    if (!paymentsSheet) {
        missing.push(
            "PAYMENTS"
        );
    }

    if (!remarksSheet) {
        missing.push(
            "DAILY REMARKS"
        );
    }

    if (!inventorySheet) {
        missing.push(
            "MASTERLIST INVENTORY"
        );
    }


    if (missing.length) {

        showError(
            "Missing sheet(s): " +
            missing.join(", ") +
            ". Please check the sheet names in your Excel file."
        );

        updateSheetStatus(
            "ptp",
            !!ptpSheet
        );

        updateSheetStatus(
            "payments",
            !!paymentsSheet
        );

        updateSheetStatus(
            "remarks",
            !!remarksSheet
        );

        updateSheetStatus(
            "inventory",
            !!inventorySheet
        );

        return;

    }


    /* =====================================================
       READ ALL FOUR SHEETS
    ===================================================== */

    collectionData.ptp =
        readSheet(
            workbook.Sheets[
                ptpSheet
            ]
        );


    collectionData.payments =
        readSheet(
            workbook.Sheets[
                paymentsSheet
            ]
        );


    collectionData.remarks =
        readSheet(
            workbook.Sheets[
                remarksSheet
            ]
        );


    collectionData.inventory =
        readSheet(
            workbook.Sheets[
                inventorySheet
            ]
        );


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    updateSheetStatus(
        "ptp",
        true,
        collectionData.ptp.length
    );


    updateSheetStatus(
        "payments",
        true,
        collectionData.payments.length
    );


    updateSheetStatus(
        "remarks",
        true,
        collectionData.remarks.length
    );


    updateSheetStatus(
        "inventory",
        true,
        collectionData.inventory.length
    );


    excelStatus.classList.remove(
        "hidden"
    );


    statusMessage.textContent =
        "Excel workbook loaded successfully. " +
        "All 4 sheets are ready for dashboard calculations.";


    console.log(
        "PTP:",
        collectionData.ptp.length
    );

    console.log(
        "PAYMENTS:",
        collectionData.payments.length
    );

    console.log(
        "DAILY REMARKS:",
        collectionData.remarks.length
    );

    console.log(
        "MASTERLIST INVENTORY:",
        collectionData.inventory.length
    );


    /*
       This is where we will connect
       your conditions/calculations later.
    */

}


/* =========================================================
   FIND SHEET
========================================================= */

function findSheet(
    sheetNames,
    possibleNames
) {

    const normalizedNames =
        sheetNames.map(
            name => ({
                original: name,
                normalized:
                    normalizeSheetName(name)
            })
        );


    for (
        const possibleName
        of possibleNames
    ) {

        const normalizedPossible =
            normalizeSheetName(
                possibleName
            );


        const found =
            normalizedNames.find(
                item =>
                    item.normalized ===
                    normalizedPossible
            );


        if (found) {

            return found.original;

        }

    }


    return null;

}


/* =========================================================
   NORMALIZE SHEET NAME
========================================================= */

function normalizeSheetName(
    value
) {

    return String(value || "")
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toUpperCase();

}


/* =========================================================
   READ SHEET
========================================================= */

function readSheet(sheet) {

    return XLSX.utils.sheet_to_json(
        sheet,
        {
            defval: "",
            raw: true
        }
    );

}


/* =========================================================
   UPDATE SHEET STATUS
========================================================= */

function updateSheetStatus(
    type,
    loaded,
    count = 0
) {

    const elementMap = {

        ptp:
            "sheetPTP",

        payments:
            "sheetPayments",

        remarks:
            "sheetRemarks",

        inventory:
            "sheetInventory"

    };


    const element =
        document.getElementById(
            elementMap[type]
        );


    if (!element) {
        return;
    }


    element.classList.remove(
        "loaded",
        "error"
    );


    const small =
        element.querySelector(
            "small"
        );


    if (loaded) {

        element.classList.add(
            "loaded"
        );

        small.textContent =
            count.toLocaleString() +
            " records loaded";

    }
    else {

        element.classList.add(
            "error"
        );

        small.textContent =
            "Sheet not found";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    excelStatus.classList.remove(
        "hidden"
    );


    statusMessage.textContent =
        message;


    statusMessage.style.color =
        "#dc3545";

}


/* =========================================================
   MONTH SELECT
========================================================= */

const monthSelect =
    document.getElementById(
        "monthSelect"
    );
monthSelect.addEventListener(
    "change",
    function () {

        console.log(
            "Selected month:",
            this.value
        );

        /*
           Later this will filter the
           Excel data and calculate the
           dashboard for the selected month.
        */

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

console.log(
    "MC22 Collection / Amounts loaded."
);

console.log(
    "Waiting for Excel workbook..."
);
