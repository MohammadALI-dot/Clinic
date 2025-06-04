const express = require("express");
const db = require("../utils/database");

const router = express.Router();

//home page
router.get("/add", (req, res, next) => {
    res.send("<h1>home page</h1>");
});

//see the two choice after correct login 
router.get("/add-view-patient", (req, res, next) => {
    res.render("add-view-patient", {
        pageTitle: "Choice Page"
    });
});

//when i click on button of search
router.get("/view-patient", (req, res, next) => {
    res.render("view-patient", {
        pageTitle: "Patient Search"
    });
});

//when I click on button of add patient(get)
router.get("/add-patient", (req, res, next) => {
    res.render("add-patient", {
        pageTitle: "Add Patient",
    });
});

//when I click on button of add patient(post)
router.post("/add-patient", (req, res, next) => {
    if (
        !req.body.name ||
        !req.body.phone ||
        !req.body.date ||
        !req.body.age ||
        !req.body.address ||
        !req.body.weeks ||
        !req.body.amount
    ) {
        return res.status(500).send({
            success: false,
            message: "the content is invalid"
        });
    }

    db.execute(
        "INSERT INTO about_patients.add_patient(fullname, phone_number, date, age, address, week, File, note, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [req.body.name, req.body.phone, req.body.date, req.body.age, req.body.address, req.body.weeks, req.body.file, req.body.notes, req.body.amount]
    )
    .then((result) => { res.redirect("/admin/add-view-patient") })
    .catch((error) => { console.log("you have an error in add patient (post) :", error) });
});

//when I click on button of view patient
router.get("/view", (req, res, next) => {
    let sqlProduct = [];

    db.execute('SELECT * FROM about_patients.add_patient')
    .then((result) => {
        sqlProduct = result[0];
        res.render("view-patient", {
            pageTitle: "View Patient",
            patients: sqlProduct
        });
    })
    .catch((error) => {
        console.error("Error fetching patients:", error);
        res.render("HomePage", {
            pageTitle: "Home Page"
        });
    });
});

//when I click on view patient in the page view-patient(get)
router.get("/view-patient/:productId", (req, res, next) => {
    const productId = req.params.productId;

    // First, get the patient details
    db.execute('SELECT * FROM about_patients.add_patient WHERE id = ?', [productId])
    .then(([patientResults]) => {
        if (patientResults.length === 0) {
            return res.render("404", { pageTitle: "Error" });
        }

        const patient = patientResults[0];
        
        // Then, get payment history for this patient if the payment_info table exists
        db.execute('SELECT * FROM about_patients.payment_info WHERE patient_id = ? ORDER BY payment_date DESC', [productId])
        .then(([paymentResults]) => {
            res.render("patient-info", {
                pageTitle: "Patient Information",
                patient: patient,
                payments: paymentResults || []
            });
        })
        .catch((error) => {
            console.error("Error fetching payment history (this may be normal if table doesn't exist yet):", error);
            // Continue even if no payment history is found
            res.render("patient-info", {
                pageTitle: "Patient Information",
                patient: patient,
                payments: []
            });
        });
    })
    .catch((error) => {
        console.error("Database Error:", error);
        res.status(500).render("404", { pageTitle: "Error" });
    });
});

//View purchase
router.get("/purchase", async (req, res) => {
  try {
    // Get all purchases
    const [purchases] = await db.execute("SELECT * FROM purchase ORDER BY date DESC");

    // Get total unpaid purchase amount
    const unpaidTotal = purchases
      .filter(p => p.status.trim().toLowerCase() === 'unpaid')
      .reduce((sum, p) => sum + parseFloat(p.price), 0);

    // Get total purchases for current month
    const totalPurchases = purchases
      .filter(p => {
        const d = new Date(p.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + parseFloat(p.price), 0);

    // Get total income from patients for current month
    const [incomeResult] = await db.execute(`
      SELECT SUM(amount) AS total_income
      FROM add_patient
      WHERE MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())
    `);
    const totalIncome = incomeResult[0].total_income || 0;

    // Calculate profit
    const profit = totalIncome - totalPurchases;

    res.render("purchase", {
      pageTitle: "Purchase",
      purchases: purchases,
      unpaidTotal: unpaidTotal.toFixed(2),
      totalIncome: totalIncome.toFixed(2),
      totalPurchases: totalPurchases.toFixed(2),
      profit: profit.toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading data");
  }
});



router.post("/purchase",(req,res,next)=>{

    db.execute("INSERT INTO purchase (name_purchase, price, date, descrption, status) VALUES (?, ?, ?, ?, ?)",
        [req.body.name_purchase, req.body.amount, req.body.datee, req.body.description, req.body.status]
    )
    .then((result)=>{console.log("Purchase added successfully")})
    .catch((error)=>{console.log(error)})

})

//when I click on view patient in the page view-patient(post)
// Process payment submission
router.post("/view-patient/:productId", (req, res, next) => {
    const productId = req.params.productId; // Get patient ID from URL
    const today = new Date().toISOString().split('T')[0]; // Current Date
    const treatment = req.body.treatment; // New treatment field
    
    // Parse total_amount and paid as numbers to prevent string concatenation
    const totalAmount = parseFloat(req.body.total_amount);
    const paidAmount = parseFloat(req.body.paid);
    const unpaidAmount = totalAmount - paidAmount; // Calculate unpaid amount
    
    console.log("Processing payment:", {
        patientId: productId,
        treatment,
        totalAmount,
        paidAmount,
        unpaidAmount,
        date: today
    });

    // First, check if the payment_info table exists, if not create it with treatment column
    db.execute(`
        CREATE TABLE IF NOT EXISTS about_patients.payment_info (
            payment_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            treatment VARCHAR(255),
            total_amount DECIMAL(10, 2) NOT NULL,
            paid DECIMAL(10, 2) NOT NULL,
            unpaid DECIMAL(10, 2) NOT NULL,
            payment_date DATE NOT NULL,
            INDEX (patient_id)
        )
    `)
    .then(() => {
        // Check if the treatment column exists
        return db.execute(`
            SHOW COLUMNS FROM about_patients.payment_info LIKE 'treatment'
        `);
    })
    .then(([columns]) => {
        // If treatment column doesn't exist, add it
        if (columns.length === 0) {
            return db.execute(`
                ALTER TABLE about_patients.payment_info 
                ADD COLUMN treatment VARCHAR(255) AFTER patient_id
            `);
        }
        return Promise.resolve();
    })
    .then(() => {
        // Now insert the payment record with treatment
        return db.execute(
            "INSERT INTO about_patients.payment_info(patient_id, treatment, total_amount, paid, unpaid, payment_date) VALUES (?, ?, ?, ?, ?, ?)", 
            [productId, treatment, totalAmount, paidAmount, unpaidAmount, today]
        );
    })
    .then(() => {
        // Redirect back to the patient info page to see the updated payment history
        res.redirect(`/admin/view-patient/${productId}`);
    })
    .catch((error) => {
        console.error("Error adding payment:", error);
        res.status(500).send("Database error when adding payment");
    });
});

// Delete patient
router.post("/delete-patient/:productId", (req, res, next) => {
    const productId = req.params.productId;
    console.log("Id deleted: " + productId);
    
    db.execute("DELETE FROM about_patients.add_patient WHERE id = ?", [productId])
    .then((result) => {
        res.redirect("/admin/add-view-patient");
    })
    .catch((error) => {
        console.log("Failed to delete patient:", error);
        res.status(500).send("Database error when deleting patient");
    });
});

router.get("/search", (req, res) => {
    const searchQuery = req.query.search || "";
    const likeQuery = `%${searchQuery}%`;

    db.execute(
        "SELECT * FROM add_patient WHERE fullname LIKE ? OR amount LIKE ?",
        [likeQuery, likeQuery]
    )
    .then(([rows]) => {
        
        res.render("view-patient", {
            pageTitle: "Patient",
            patients: Array.isArray(rows) ? rows : [] 
        });
    })
    .catch((err) => {
        console.error("Search query failed:", err);
        res.status(500).send("Internal Server Error");
    });
});



module.exports = router;