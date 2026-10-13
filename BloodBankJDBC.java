import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Scanner;

/**
 * Blood Bank Management System: Pure Java JDBC Interface
 * 
 * Features:
 *   1. Connection establishment using Oracle JDBC Driver (XE).
 *   2. Retrieval (SELECT) of all donors and parameterized search by Blood Group / City.
 *   3. Parameterized INSERT using PreparedStatement.
 *   4. Parameterized UPDATE using PreparedStatement and display affected rows.
 *   5. Parameterized DELETE using PreparedStatement with target verification.
 *   6. Transaction Management (setAutoCommit(false), commit(), rollback()).
 * 
 * @author Blood Bank Management Team (VIT Chennai)
 */
public class BloodBankJDBC {

    // Database Credentials for Oracle Database (Express Edition XE)
    private static final String DB_URL = "jdbc:oracle:thin:@localhost:1521:XE";
    private static final String DB_USER = "system";
    private static final String DB_PASSWORD = "password";

    private static Connection getConnection() throws SQLException, ClassNotFoundException {
        // Step 1: Load Oracle JDBC Driver
        Class.forName("oracle.jdbc.OracleDriver");
        // Step 2: Establish connection
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("==================================================");
        System.out.println("  BLOOD BANK MANAGEMENT SYSTEM (JDBC INTERFACE)   ");
        System.out.println("        Relational Database Operations Engine     ");
        System.out.println("==================================================");

        try (Connection con = getConnection()) {
            System.out.println("[SUCCESS] Connected to Oracle Database successfully.\n");

            while (true) {
                System.out.println("----------------------------------------------");
                System.out.println("1. View All Donors (SELECT Statement)");
                System.out.println("2. Search Donors by Blood Group (PreparedStatement)");
                System.out.println("3. Register New Donor (INSERT PreparedStatement)");
                System.out.println("4. Update Donor Contact / City (UPDATE PreparedStatement)");
                System.out.println("5. Delete Donor Record (DELETE PreparedStatement)");
                System.out.println("6. Execute Blood Unit Dispatch Transaction (COMMIT/ROLLBACK)");
                System.out.println("7. View Blood Stock Inventory");
                System.out.println("8. Exit");
                System.out.print("Enter your choice (1-8): ");

                int choice = scanner.nextInt();
                scanner.nextLine(); // consume newline

                switch (choice) {
                    case 1:
                        displayAllDonors(con);
                        break;
                    case 2:
                        searchDonorsByBloodGroup(con, scanner);
                        break;
                    case 3:
                        insertDonor(con, scanner);
                        break;
                    case 4:
                        updateDonor(con, scanner);
                        break;
                    case 5:
                        deleteDonor(con, scanner);
                        break;
                    case 6:
                        executeDispatchTransaction(con, scanner);
                        break;
                    case 7:
                        displayBloodStock(con);
                        break;
                    case 8:
                        System.out.println("Exiting Blood Bank Management System. Goodbye!");
                        return;
                    default:
                        System.out.println("[WARNING] Invalid choice. Please enter 1 to 8.");
                }
            }

        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] Oracle JDBC Driver not found on classpath: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("[DATABASE ERROR] SQL Exception: " + e.getMessage());
            e.printStackTrace();
        } finally {
            scanner.close();
        }
    }

    /**
     * Task 1: SELECT Query to fetch and display all donors
     */
    private static void displayAllDonors(Connection con) throws SQLException {
        String query = "SELECT DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS FROM DONOR ORDER BY DONOR_ID";
        try (Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            System.out.println("\n--- REGISTERED BLOOD DONORS ---");
            System.out.printf("%-8s %-22s %-6s %-5s %-8s %-15s %-12s %-6s %-10s%n",
                    "DONOR_ID", "NAME", "GROUP", "AGE", "GENDER", "PHONE", "CITY", "HB", "STATUS");
            System.out.println("----------------------------------------------------------------------------------------------------");

            boolean found = false;
            while (rs.next()) {
                found = true;
                System.out.printf("%-8s %-22s %-6s %-5d %-8s %-15s %-12s %-6.1f %-10s%n",
                        rs.getString("DONOR_ID"),
                        rs.getString("NAME"),
                        rs.getString("BLOOD_GROUP"),
                        rs.getInt("AGE"),
                        rs.getString("GENDER"),
                        rs.getString("PHONE"),
                        rs.getString("CITY"),
                        rs.getDouble("HEMOGLOBIN"),
                        rs.getString("STATUS"));
            }

            if (!found) {
                System.out.println("[INFO] No donors found in database.");
            }
            System.out.println();
        }
    }

    /**
     * Task 2: Parameterized SELECT using PreparedStatement
     */
    private static void searchDonorsByBloodGroup(Connection con, Scanner scanner) throws SQLException {
        System.out.print("Enter Blood Group to search (e.g. O+, A-, B+): ");
        String bg = scanner.nextLine().trim().toUpperCase();

        String sql = "SELECT DONOR_ID, NAME, BLOOD_GROUP, PHONE, CITY, STATUS FROM DONOR WHERE BLOOD_GROUP = ? AND STATUS = 'Eligible'";
        try (PreparedStatement pstmt = con.prepareStatement(sql)) {
            pstmt.setString(1, bg);

            try (ResultSet rs = pstmt.executeQuery()) {
                System.out.println("\n--- ELIGIBLE DONORS FOR BLOOD GROUP: " + bg + " ---");
                boolean found = false;
                while (rs.next()) {
                    found = true;
                    System.out.println(rs.getString("DONOR_ID") + " | " +
                            rs.getString("NAME") + " | " +
                            rs.getString("PHONE") + " | " +
                            rs.getString("CITY") + " | " +
                            rs.getString("STATUS"));
                }
                if (!found) {
                    System.out.println("[INFO] No eligible matching donors found for blood group: " + bg);
                }
                System.out.println();
            }
        }
    }

    /**
     * Task 3: Parameterized INSERT using PreparedStatement
     */
    private static void insertDonor(Connection con, Scanner scanner) throws SQLException {
        System.out.print("Enter Donor ID (e.g. D109): ");
        String id = scanner.nextLine().trim();
        System.out.print("Enter Full Name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-): ");
        String bg = scanner.nextLine().trim().toUpperCase();
        System.out.print("Enter Age (18-65): ");
        int age = scanner.nextInt();
        scanner.nextLine();
        System.out.print("Enter Gender (Male/Female/Other): ");
        String gender = scanner.nextLine().trim();
        System.out.print("Enter Phone: ");
        String phone = scanner.nextLine().trim();
        System.out.print("Enter City: ");
        String city = scanner.nextLine().trim();
        System.out.print("Enter Hemoglobin (g/dL): ");
        double hb = scanner.nextDouble();
        scanner.nextLine();

        String status = hb >= 12.5 ? "Eligible" : "Deferred";

        String insertSQL = "INSERT INTO DONOR (DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = con.prepareStatement(insertSQL)) {
            pstmt.setString(1, id);
            pstmt.setString(2, name);
            pstmt.setString(3, bg);
            pstmt.setInt(4, age);
            pstmt.setString(5, gender);
            pstmt.setString(6, phone);
            pstmt.setString(7, city);
            pstmt.setDouble(8, hb);
            pstmt.setString(9, status);

            int rows = pstmt.executeUpdate();
            System.out.println("[SUCCESS] " + rows + " row(s) inserted into DONOR table. Status: " + status);
        } catch (SQLException e) {
            System.err.println("[INSERT FAILED] " + e.getMessage());
        }
    }

    /**
     * Task 4: Parameterized UPDATE and display affected rows
     */
    private static void updateDonor(Connection con, Scanner scanner) throws SQLException {
        System.out.print("Enter Donor ID to update: ");
        String id = scanner.nextLine().trim();
        System.out.print("Enter New Phone Number: ");
        String phone = scanner.nextLine().trim();
        System.out.print("Enter New City: ");
        String city = scanner.nextLine().trim();

        String updateSQL = "UPDATE DONOR SET PHONE = ?, CITY = ? WHERE DONOR_ID = ?";
        try (PreparedStatement pstmt = con.prepareStatement(updateSQL)) {
            pstmt.setString(1, phone);
            pstmt.setString(2, city);
            pstmt.setString(3, id);

            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("[SUCCESS] UPDATE completed! Affected rows: " + rowsAffected);
            } else {
                System.out.println("[WARNING] No donor found with ID: " + id + ". 0 rows updated.");
            }
        }
    }

    /**
     * Task 5: Parameterized DELETE with verification
     */
    private static void deleteDonor(Connection con, Scanner scanner) throws SQLException {
        System.out.print("Enter Donor ID to delete: ");
        String id = scanner.nextLine().trim();

        System.out.print("Are you sure you want to permanently delete " + id + "? (Y/N): ");
        String confirm = scanner.nextLine().trim().toUpperCase();
        if (!confirm.equals("Y")) {
            System.out.println("[CANCELLED] Deletion cancelled by user.");
            return;
        }

        String deleteSQL = "DELETE FROM DONOR WHERE DONOR_ID = ?";
        try (PreparedStatement pstmt = con.prepareStatement(deleteSQL)) {
            pstmt.setString(1, id);
            int rowsDeleted = pstmt.executeUpdate();

            if (rowsDeleted > 0) {
                System.out.println("[SUCCESS] DELETE completed! Rows deleted: " + rowsDeleted);
            } else {
                System.out.println("[WARNING] Donor ID " + id + " does not exist. 0 rows deleted.");
            }
        }
    }

    /**
     * Task 6: Transaction Challenge (setAutoCommit(false), commit(), rollback())
     */
    private static void executeDispatchTransaction(Connection con, Scanner scanner) {
        System.out.print("Enter Blood Group for Emergency Hospital Request (e.g. O-): ");
        String bg = scanner.nextLine().trim().toUpperCase();
        System.out.print("Enter Units required: ");
        int units = scanner.nextInt();
        scanner.nextLine();

        try {
            // Disable Auto-Commit for Transaction Boundary
            con.setAutoCommit(false);

            // Step 1: Check available units
            String checkSQL = "SELECT UNITS_AVAILABLE FROM BLOOD_STOCK WHERE BLOOD_GROUP = ? FOR UPDATE";
            int available = 0;
            try (PreparedStatement pstmtCheck = con.prepareStatement(checkSQL)) {
                pstmtCheck.setString(1, bg);
                try (ResultSet rs = pstmtCheck.executeQuery()) {
                    if (rs.next()) {
                        available = rs.getInt("UNITS_AVAILABLE");
                    } else {
                        throw new SQLException("Blood Group " + bg + " does not exist in stock table.");
                    }
                }
            }

            if (available < units) {
                // Constraint condition violated -> ROLLBACK
                System.err.println("[TRANSACTION ERROR] Insufficient units for " + bg + ". Available: " + available + ", Required: " + units);
                con.rollback();
                System.out.println("[ROLLBACK EXECUTED] Database state preserved without changes.");
                return;
            }

            // Step 2: Deduct Stock
            String deductSQL = "UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE - ? WHERE BLOOD_GROUP = ?";
            try (PreparedStatement pstmtDeduct = con.prepareStatement(deductSQL)) {
                pstmtDeduct.setInt(1, units);
                pstmtDeduct.setString(2, bg);
                pstmtDeduct.executeUpdate();
            }

            // Step 3: Insert Transaction Audit Record
            String auditSQL = "INSERT INTO DISPATCH_LOG (DISPATCH_ID, BLOOD_GROUP, UNITS, DISPATCH_DATE) VALUES ('DISP-' || DISPATCH_SEQ.NEXTVAL, ?, ?, SYSDATE)";
            try (PreparedStatement pstmtAudit = con.prepareStatement(auditSQL)) {
                pstmtAudit.setString(1, bg);
                pstmtAudit.setInt(2, units);
                pstmtAudit.executeUpdate();
            }

            // Step 4: Commit on success
            con.commit();
            System.out.println("[SUCCESS - TRANSACTION COMMITTED] Deducted " + units + " units of " + bg + " and logged dispatch.");

        } catch (SQLException e) {
            try {
                System.err.println("[EXCEPTION] " + e.getMessage() + ". Rolling back transaction...");
                con.rollback();
                System.out.println("[ROLLBACK COMPLETED] Database returned to consistent state.");
            } catch (SQLException rollbackEx) {
                rollbackEx.printStackTrace();
            }
        } finally {
            try {
                con.setAutoCommit(true); // Restore default
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Task 7: View Blood Stock
     */
    private static void displayBloodStock(Connection con) throws SQLException {
        String sql = "SELECT BLOOD_GROUP, UNITS_AVAILABLE, MIN_SAFE_LEVEL, STATUS FROM BLOOD_STOCK ORDER BY BLOOD_GROUP";
        try (Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("\n--- BLOOD STOCK INVENTORY ---");
            System.out.printf("%-12s %-18s %-16s %-12s%n", "BLOOD_GROUP", "UNITS_AVAILABLE", "MIN_SAFE_LEVEL", "STATUS");
            System.out.println("------------------------------------------------------------");
            while (rs.next()) {
                System.out.printf("%-12s %-18d %-16d %-12s%n",
                        rs.getString("BLOOD_GROUP"),
                        rs.getInt("UNITS_AVAILABLE"),
                        rs.getInt("MIN_SAFE_LEVEL"),
                        rs.getString("STATUS"));
            }
            System.out.println();
        }
    }
}
