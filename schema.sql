-- =============================================================================
-- Schema: Blood Bank Management System (Oracle 11g / 19c / 21c / XE / H2)
-- =============================================================================

-- Clean up existing tables and sequences
DROP TABLE DISPATCH_LOG CASCADE CONSTRAINTS;
DROP TABLE HOSPITAL_REQUESTS CASCADE CONSTRAINTS;
DROP TABLE BLOOD_BAGS CASCADE CONSTRAINTS;
DROP TABLE BLOOD_STOCK CASCADE CONSTRAINTS;
DROP TABLE DONOR CASCADE CONSTRAINTS;
DROP SEQUENCE DISPATCH_SEQ;

-- 1. Table: DONOR
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

-- 2. Table: BLOOD_STOCK
CREATE TABLE BLOOD_STOCK (
    BLOOD_GROUP VARCHAR2(5) PRIMARY KEY,
    UNITS_AVAILABLE NUMBER(5) DEFAULT 0 CHECK (UNITS_AVAILABLE >= 0),
    MAX_CAPACITY NUMBER(5) DEFAULT 50,
    MIN_SAFE_LEVEL NUMBER(5) DEFAULT 12,
    STATUS VARCHAR2(20) DEFAULT 'ADEQUATE',
    CONSTRAINT FK_STOCK_BG CHECK (BLOOD_GROUP IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

-- 3. Table: BLOOD_BAGS (Individual Bags Ledger)
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

-- 4. Table: HOSPITAL_REQUESTS
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

-- 5. Table: DISPATCH_LOG (Transaction Audit)
CREATE SEQUENCE DISPATCH_SEQ START WITH 1001 INCREMENT BY 1;

CREATE TABLE DISPATCH_LOG (
    DISPATCH_ID VARCHAR2(20) PRIMARY KEY,
    BLOOD_GROUP VARCHAR2(5) NOT NULL,
    UNITS NUMBER(3) NOT NULL,
    DISPATCH_DATE DATE DEFAULT SYSDATE
);

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Populate Initial Donors
INSERT INTO DONOR VALUES ('D101', 'Dr. Aravind Swaminathan', 'O-', 28, 'Male', '+91 98401 23456', 'aravind.s@vit.ac.in', 'Chennai', 14.5, 'Eligible');
INSERT INTO DONOR VALUES ('D102', 'Priyanka Sundaram', 'A+', 24, 'Female', '+91 97890 87654', 'priyanka.s@gmail.com', 'Vellore', 13.2, 'Eligible');
INSERT INTO DONOR VALUES ('D103', 'Karthik Ramanathan', 'B+', 32, 'Male', '+91 94441 54321', 'karthik.r@yahoo.com', 'Chennai', 15.1, 'Eligible');
INSERT INTO DONOR VALUES ('D104', 'Sneha Narayanan', 'AB-', 22, 'Female', '+91 98840 99887', 'sneha.n@vit.ac.in', 'Bangalore', 12.8, 'Eligible');
INSERT INTO DONOR VALUES ('D105', 'Manoj Kumar', 'O+', 29, 'Male', '+91 99620 11223', 'manoj.k@outlook.com', 'Madurai', 14.0, 'Eligible');
INSERT INTO DONOR VALUES ('D106', 'Deepa Krishnan', 'A-', 35, 'Female', '+91 94432 44556', 'deepa.krish@gmail.com', 'Coimbatore', 11.8, 'Deferred');
INSERT INTO DONOR VALUES ('D107', 'Venkatesh Prasad', 'B-', 41, 'Male', '+91 98410 77889', 'v.prasad@health.in', 'Chennai', 14.8, 'Eligible');
INSERT INTO DONOR VALUES ('D108', 'Ananya Raghavan', 'AB+', 26, 'Female', '+91 97909 33221', 'ananya.ragh@vit.ac.in', 'Vellore', 13.6, 'Eligible');

-- Populate Blood Stock
INSERT INTO BLOOD_STOCK VALUES ('A+', 28, 50, 15, 'ADEQUATE');
INSERT INTO BLOOD_STOCK VALUES ('A-', 9, 30, 12, 'LOW');
INSERT INTO BLOOD_STOCK VALUES ('B+', 35, 50, 15, 'ADEQUATE');
INSERT INTO BLOOD_STOCK VALUES ('B-', 14, 30, 10, 'ADEQUATE');
INSERT INTO BLOOD_STOCK VALUES ('AB+', 22, 35, 12, 'ADEQUATE');
INSERT INTO BLOOD_STOCK VALUES ('AB-', 4, 25, 8, 'CRITICAL');
INSERT INTO BLOOD_STOCK VALUES ('O+', 44, 60, 20, 'ADEQUATE');
INSERT INTO BLOOD_STOCK VALUES ('O-', 6, 35, 12, 'CRITICAL');

-- Populate Hospital Requests
INSERT INTO HOSPITAL_REQUESTS VALUES ('REQ-501', 'Apollo Specialty Hospital, Chennai', 'Kavitha Shanmugam', 'O-', 2, 'Emergency STAT', SYSDATE, 'Pending');
INSERT INTO HOSPITAL_REQUESTS VALUES ('REQ-502', 'CMC Hospital, Vellore', 'Rahul Verma', 'B+', 3, 'High Priority', SYSDATE, 'Approved');
INSERT INTO HOSPITAL_REQUESTS VALUES ('REQ-503', 'MIOT International, Chennai', 'Divya Nair', 'A+', 1, 'Routine', SYSDATE, 'Fulfilled');

COMMIT;

-- Verification Queries
SELECT * FROM DONOR;
SELECT * FROM BLOOD_STOCK;
SELECT * FROM HOSPITAL_REQUESTS;
