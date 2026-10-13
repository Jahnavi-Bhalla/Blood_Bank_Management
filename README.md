# HemoPulse™ - Blood Bank Management System

> **BACSE202: Database Systems Laboratory — PAT 4 (Open Internet Test)**  
> **Topic:** Blood Bank & Transfusion Management System  
> **Institution:** School of Computer Science & Engineering (SCOPE), VIT Chennai  

---

## 🩸 1. Problem Statement & System Overview

**HemoPulse™** is an end-to-end, medical-grade Blood Bank Management platform designed to replace legacy paper records and fragile NoSQL models with an authentic **relational database architecture (Oracle SQL\*Plus & Java JDBC / ODBC)**.

### Core Architecture & Capabilities:
- **100% Relational Schema**: Strict normalization into relational entities (`DONOR`, `BLOOD_STOCK`, `BLOOD_BAGS`, `HOSPITAL_REQUESTS`, `DISPATCH_LOG`).
- **Zero MongoDB / NoSQL**: Pure relational tables with Primary Keys, Foreign Keys, cascading rules, and check constraints.
- **Java JDBC Core**: Standalone console interface (`BloodBankJDBC.java`) and lightweight HTTP server (`BloodBankServer.java`) utilizing core `java.sql.*` APIs (`PreparedStatement`, `ResultSet`, `ResultSetMetaData`, and transaction control).
- **Interactive Web Interface**: Live responsive dashboard on `http://localhost:3000` with 8 blood group inventory gauges (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), biological compatibility explorer, interactive in-browser SQL terminal, and donor card generator.

---

## 🔐 2. Authentication & Login Portal

The system provides dual-mode authentication meeting all security and demonstration requirements:

1. **Dedicated Standalone Login Portal (`login.html`)**:
   - Access directly at **[http://localhost:3000/login.html](http://localhost:3000/login.html)**.
   - Includes **1-Click Quick Demo Login** buttons for 3 roles:
     - 👑 **Administrator**: `admin@hemopulse.org` / `admin123` (Full system control)
     - 🔬 **Lab Technician**: `lab@hemopulse.org` / `lab123` (Inventory & Blood Bag Intake)
     - 🏥 **Hospital Doctor**: `doctor@apollo.org` / `apollo123` (Emergency Orders & Transfusion)
   - Features show/hide password toggle, session persistence in `localStorage`, and automated redirect to `index.html`.
2. **Integrated Portal Authentication Overlay**:
   - Built into `index.html` to protect views and display user profile badges with sign-out capability.

---

## 🔬 3. User Input Acceptance, Processing & Output Display (Clinical Eligibility)

Directly mirroring the evaluation criteria (similar to the professor's Loan Eligibility example), the application includes the **Donor Clinical Eligibility & Donation Volume Assessment Calculator** (accessible in the web app under the **Eligibility Calculator** tab):

### A. Inputs Accepted from User:
- **Demographics**: Donor Full Name, Gender (Male / Female / Other), Age (years), Blood Group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- **Physical & Clinical Vitals**:
  - Body Weight (kg)
  - Hemoglobin Level (g/dL)
  - Systolic & Diastolic Blood Pressure (mmHg)
  - Resting Pulse Rate (bpm)
  - Interval Elapsed Since Last Donation (days)
- **Medical Risk Questionnaire**:
  - Tattoo / Piercing in the last 6 months (Yes/No)
  - Major surgery / dental extraction in the last 3 months (Yes/No)
  - Currently on antibiotics, anticoagulants, or steroids (Yes/No)

### B. Algorithmic Processing Logic (WHO / NACO Guidelines):
1. **Age Check**: Validates `18 ≤ Age ≤ 65`.
2. **Weight Check**: Enforces minimum `50 kg` (prevents hypovolemia/vasovagal syncope).
3. **Hemoglobin Check**: Enforces `≥ 12.5 g/dL` (WHO standard for oxygen-carrying capacity).
4. **Blood Pressure Check**: Confirms Systolic `100–140 mmHg` and Diastolic `60–90 mmHg`.
5. **Pulse Check**: Confirms resting pulse between `60–100 bpm`.
6. **Recovery Interval**: Minimum `90 days` for males; `120 days` for females.
7. **Total Circulating Blood Volume Calculation** (Nadler formula approximation):
   $$\text{Circulating Volume (mL)} = \text{Weight (kg)} \times (70 \text{ for Male}, 65 \text{ for Female})$$
8. **Maximum Safe Donation Volume**:
   - If Weight $\ge 60\text{ kg} \rightarrow 450\text{ mL}$ (Standard double bag)
   - If $50 \le \text{Weight} < 60\text{ kg} \rightarrow 350\text{ mL}$ (Single bag)
   - If Weight $< 50\text{ kg} \rightarrow 0\text{ mL}$ (Deferred)
9. **Blood Component Fractionation Yield**:
   - Packed Red Blood Cells (PRBC): $\approx 48\%$ of volume
   - Fresh Frozen Plasma (FFP): $\approx 40\%$ of volume
   - Platelet Concentrate: $\approx 12\%$ of volume
10. **Potential Lives Saved**: Calculated at up to 3 patient lives per donation.

### C. Output Display:
- **Decision Status Badge**:
  - 🟢 `ELIGIBLE TO DONATE` (Glowing emerald badge)
  - 🟠 `TEMPORARILY DEFERRED` (Amber badge)
- **Metrics Summary**: Gauges for Max Safe Volume (mL), Total Circulating Volume (mL), and Lives Saved.
- **Pass/Fail Clinical Checklist**: Itemized green/red badges for each vital parameter.
- **Clinical Deferral Advisory**: Specific medical recommendations and guidance to achieve eligibility.
- **Automated Relational DML Preview**: Generates parameterized SQL queries:
  ```sql
  INSERT INTO DONOR (DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS)
  VALUES ('D109', 'Aditya Sen', 'O+', 26, 'Male', '+91 98401 00000', 'Chennai', 14.2, 'Eligible');

  INSERT INTO BLOOD_BAGS (BAG_ID, DONOR_ID, BLOOD_GROUP, COMPONENT, VOLUME_ML, EXPIRY_DATE, STATUS)
  VALUES ('BAG-8821', 'D109', 'O+', 'Whole Blood', 450, SYSDATE + 35, 'Tested & Cleared');

  UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE + 1 WHERE BLOOD_GROUP = 'O+';
  COMMIT;
  ```
- **1-Click Execution**: Button to instantly persist the record into the database and update inventory.

---

## 🗄️ 4. DDL & DML Commands Catalogue

### Data Definition Language (DDL) Commands (`schema.sql`):
```sql
-- 1. Table DONOR with Constraints
CREATE TABLE DONOR (
    DONOR_ID VARCHAR2(10) PRIMARY KEY,
    NAME VARCHAR2(100) NOT NULL,
    BLOOD_GROUP VARCHAR2(5) NOT NULL,
    AGE NUMBER(3) CHECK (AGE BETWEEN 18 AND 65),
    GENDER VARCHAR2(10) CHECK (GENDER IN ('Male', 'Female', 'Other')),
    PHONE VARCHAR2(20) NOT NULL,
    EMAIL VARCHAR2(100),
    CITY VARCHAR2(50) NOT NULL,
    HEMOGLOBIN NUMBER(4,1) CHECK (HEMOGLOBIN > 0),
    STATUS VARCHAR2(15) DEFAULT 'Eligible' CHECK (STATUS IN ('Eligible', 'Deferred')),
    CONSTRAINT CHK_BLOOD_GROUP CHECK (BLOOD_GROUP IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

-- 2. Table BLOOD_STOCK
CREATE TABLE BLOOD_STOCK (
    BLOOD_GROUP VARCHAR2(5) PRIMARY KEY,
    UNITS_AVAILABLE NUMBER(5) DEFAULT 0 CHECK (UNITS_AVAILABLE >= 0),
    MAX_CAPACITY NUMBER(5) DEFAULT 50,
    MIN_SAFE_LEVEL NUMBER(5) DEFAULT 12,
    STATUS VARCHAR2(20) DEFAULT 'ADEQUATE',
    CONSTRAINT FK_STOCK_BG CHECK (BLOOD_GROUP IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

-- 3. Table BLOOD_BAGS (Foreign Key)
CREATE TABLE BLOOD_BAGS (
    BAG_ID VARCHAR2(15) PRIMARY KEY,
    DONOR_ID VARCHAR2(10) REFERENCES DONOR(DONOR_ID) ON DELETE CASCADE,
    BLOOD_GROUP VARCHAR2(5) NOT NULL,
    COMPONENT VARCHAR2(30) DEFAULT 'Whole Blood',
    VOLUME_ML NUMBER(4) DEFAULT 450,
    COLLECTED_DATE DATE DEFAULT SYSDATE,
    EXPIRY_DATE DATE NOT NULL,
    CHILLER_LOCATION VARCHAR2(50),
    STATUS VARCHAR2(20) DEFAULT 'Tested & Cleared'
);

-- 4. Table HOSPITAL_REQUESTS
CREATE TABLE HOSPITAL_REQUESTS (
    REQUEST_ID VARCHAR2(15) PRIMARY KEY,
    HOSPITAL_NAME VARCHAR2(100) NOT NULL,
    PATIENT_NAME VARCHAR2(100) NOT NULL,
    BLOOD_GROUP VARCHAR2(5) NOT NULL,
    UNITS_REQUESTED NUMBER(3) CHECK (UNITS_REQUESTED > 0),
    URGENCY VARCHAR2(25) CHECK (URGENCY IN ('Emergency STAT', 'High Priority', 'Routine')),
    REQUEST_DATE DATE DEFAULT SYSDATE,
    STATUS VARCHAR2(15) DEFAULT 'Pending' CHECK (STATUS IN ('Pending', 'Approved', 'Fulfilled', 'Rejected'))
);

-- 5. Table DISPATCH_LOG & Sequence
CREATE SEQUENCE DISPATCH_SEQ START WITH 1001 INCREMENT BY 1;
CREATE TABLE DISPATCH_LOG (
    DISPATCH_ID VARCHAR2(20) PRIMARY KEY,
    BLOOD_GROUP VARCHAR2(5) NOT NULL,
    UNITS NUMBER(3) NOT NULL,
    DISPATCH_DATE DATE DEFAULT SYSDATE
);
```

### Data Manipulation Language (DML) & TCL Commands:
```sql
-- Select all donors (Slide 37)
SELECT DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS FROM DONOR ORDER BY DONOR_ID;

-- Filter by blood group with WHERE condition
SELECT * FROM DONOR WHERE BLOOD_GROUP = 'AB-';

-- Multi-table JOIN between DONOR and BLOOD_BAGS
SELECT D.DONOR_ID, D.NAME, D.BLOOD_GROUP, B.BAG_ID, B.VOLUME_ML, B.EXPIRY_DATE
FROM DONOR D JOIN BLOOD_BAGS B ON D.DONOR_ID = B.DONOR_ID;

-- Group by and aggregation
SELECT BLOOD_GROUP, COUNT(*) AS TOTAL_DONORS FROM DONOR GROUP BY BLOOD_GROUP;

-- Parameterized INSERT using PreparedStatement
INSERT INTO DONOR VALUES ('D109', 'Vikramaditya', 'O+', 29, 'Male', '+91 98401 99999', 'vikram@vit.ac.in', 'Chennai', 14.6, 'Eligible');

-- Parameterized UPDATE
UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE + 2 WHERE BLOOD_GROUP = 'O-';

-- Parameterized DELETE
DELETE FROM DONOR WHERE DONOR_ID = 'D108';

-- Transaction Control (COMMIT & ROLLBACK)
COMMIT;
ROLLBACK;
```

---

## 🚀 5. Installation Steps & Execution Commands

### Step 1: Running the Web Application (Node.js)
```bash
# Navigate to project folder
cd c:\Users\jahna\bloodBank

# Start the full-stack server
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in any web browser.

---

### Step 2: Java JDBC Driver Setup & Compilation
1. **Download the Oracle JDBC Driver** (Type-4 Thin driver):
   ```bash
   # Download via curl or web browser
   curl -O https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc8/19.8.0.0/ojdbc8-19.8.0.0.jar
   ren ojdbc8-19.8.0.0.jar ojdbc8.jar
   ```
2. **Compile the Standalone Java JDBC Console Program**:
   ```powershell
   javac -cp ".;ojdbc8.jar" BloodBankJDBC.java
   ```
3. **Execute the Java JDBC Program**:
   ```powershell
   java -cp ".;ojdbc8.jar" BloodBankJDBC
   ```
4. **Compile & Run the Pure Java JDBC HTTP Server** (`BloodBankServer.java`):
   ```powershell
   javac -cp ".;ojdbc8.jar" BloodBankServer.java
   java -cp ".;ojdbc8.jar" BloodBankServer
   ```

---

### Step 3: Oracle Database Setup (SQL\*Plus)
1. Open SQL\*Plus and connect to the local Oracle XE instance:
   ```bash
   sqlplus system/password@localhost:1521/XE
   ```
2. Execute the DDL schema and seed scripts:
   ```sql
   @schema.sql
   @data.sql
   ```
3. Verify created tables:
   ```sql
   SELECT table_name FROM user_tables;
   ```

---

### Step 4: Windows ODBC Driver Configuration (DSN)
To satisfy the ODBC front-end connectivity requirement (Slide 11):
1. Press `Win + R`, type `odbcad32.exe`, and press Enter (ODBC Data Source Administrator 64-bit).
2. Click the **System DSN** tab, then click **Add...**.
3. Select **Oracle in OraClient11g_home1** or **Oracle in XE**, and click **Finish**.
4. Configure the fields:
   - **Data Source Name:** `BloodBankDSN`
   - **Description:** `Blood Bank Management ODBC Connection`
   - **TNS Service Name:** `XE`
   - **User ID:** `system`
5. Click **Test Connection**, enter password `password`, and confirm **"Connection successful"**.
6. Click **OK** to save.

---

## 📊 Summary Checklist & Features Overview

| System Requirement | Implementation in HemoPulse™ | Verification Link |
|---|---|---|
| **1. Web App based on assigned problem** | Full Blood Bank Management System (Donors, Stock, Orders, Logs) | `http://localhost:3000` |
| **2. Login Page** | Dedicated standalone `login.html` with roles + integrated auth overlay | `http://localhost:3000/login.html` |
| **3. Accept inputs, process & display output** | Clinical Eligibility & Volume Calculator (Age, Weight, Hb, BP, Interval $\rightarrow$ Decision, Safe Volume, Yield, DML) | Tab: **Eligibility Calculator** |
| **4. Include all DDL & DML commands** | Dedicated interactive command center (`CREATE TABLE`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `COMMIT`, `ROLLBACK`) | Tab: **DDL & DML Commands** |
| **5. Installation commands & Driver setup** | Complete guide for Node.js, Java JDBC (`ojdbc8.jar`), ODBC DSN, and SQL\*Plus | Tab: **System Guide** & `README.md` |
