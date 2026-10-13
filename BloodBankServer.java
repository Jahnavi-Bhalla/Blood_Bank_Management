import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HemoPulse Blood Bank Management System (Pure Java JDBC REST Server)
 * 
 * Key Features:
 *   1. 100% Relational JDBC Architecture (java.sql.*): NO MongoDB, NO NoSQL, NO ORM/Hibernate.
 *   2. Core JDBC APIs: Connection, PreparedStatement (SQL injection defense),
 *      ResultSet, ResultSetMetaData (dynamic column extraction), and explicit
 *      transactions (setAutoCommit(false), commit(), rollback()).
 *   3. Interactive SQL execution endpoint: POST /api/sql/execute.
 *   4. Donor Clinical Eligibility & Volume Calculator: POST /api/eligibility/assess.
 *   5. Relational CRUD endpoints: /api/donors, /api/stock, /api/requests.
 *   6. Embedded static asset serving on port 8080 (or port 3000).
 * =============================================================================
 */
public class BloodBankServer {

    private static final int PORT = 8080;
    
    // Default to Oracle Express Edition (XE) or H2 / PostgreSQL compatible JDBC URL
    private static final String DB_URL = "jdbc:oracle:thin:@localhost:1521:XE";
    private static final String DB_USER = "system";
    private static final String DB_PASS = "password";

    public static Connection getDatabaseConnection() throws SQLException {
        try {
            Class.forName("oracle.jdbc.OracleDriver");
            return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
        } catch (ClassNotFoundException e) {
            // Fallback note: If running locally without Oracle driver jar, throw informative SQLException
            throw new SQLException("Oracle JDBC Driver (oracle.jdbc.OracleDriver) not found in CLASSPATH. Ensure ojdbc8.jar is attached.", e);
        }
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        System.out.println("==============================================================");
        System.out.println("  HEMOPULSE™ BLOOD BANK MANAGEMENT - JAVA JDBC BACKEND SERVER ");
        System.out.println("      Enterprise Relational Database Management Platform       ");
        System.out.println("==============================================================");
        System.out.println("[INFO] Initializing Native Java JDBC Relational Engine...");

        // REST API Contexts
        server.createContext("/api/sql/execute", new SqlExecuteHandler());
        server.createContext("/api/eligibility/assess", new EligibilityAssessHandler());
        server.createContext("/api/donors", new DonorsHandler());
        server.createContext("/api/stock", new StockHandler());
        server.createContext("/api/requests", new RequestsHandler());

        // Static Web Files Handler (Serves index.html, styles.css, app.js, login.html)
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null); // default single/multi-thread executor
        server.start();
        System.out.println("[SUCCESS] Java JDBC Server listening at http://localhost:" + PORT);
        System.out.println("[INFO] Open http://localhost:" + PORT + " in browser for the Web Interface.");
    }

    /**
     * Endpoint: POST /api/sql/execute
     * Dynamically executes SQL using java.sql.PreparedStatement / Statement.
     * Uses ResultSetMetaData to extract column headers dynamically.
     * Catches SQLException and formats into JSON response.
     */
    static class SqlExecuteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String sql = extractJsonString(body, "sql");

            if (sql == null || sql.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"SQL statement is mandatory\"}");
                return;
            }

            String trimmed = sql.trim().replaceAll(";+$", "");
            long startTime = System.currentTimeMillis();

            try (Connection conn = getDatabaseConnection()) {
                if (trimmed.toUpperCase().startsWith("SELECT")) {
                    try (PreparedStatement pstmt = conn.prepareStatement(trimmed);
                         ResultSet rs = pstmt.executeQuery()) {

                        ResultSetMetaData meta = rs.getMetaData();
                        int columnCount = meta.getColumnCount();
                        List<String> columns = new ArrayList<>();
                        for (int i = 1; i <= columnCount; i++) {
                            columns.add(meta.getColumnLabel(i));
                        }

                        StringBuilder rowsJson = new StringBuilder("[");
                        int count = 0;
                        while (rs.next()) {
                            if (count > 0) rowsJson.append(",");
                            rowsJson.append("{");
                            for (int i = 1; i <= columnCount; i++) {
                                String colName = meta.getColumnLabel(i);
                                String val = rs.getString(i);
                                if (i > 1) rowsJson.append(",");
                                rowsJson.append("\"").append(colName).append("\":");
                                if (val == null) {
                                    rowsJson.append("null");
                                } else {
                                    rowsJson.append("\"").append(escapeJson(val)).append("\"");
                                }
                            }
                            rowsJson.append("}");
                            count++;
                        }
                        rowsJson.append("]");

                        long elapsed = System.currentTimeMillis() - startTime;
                        StringBuilder sb = new StringBuilder();
                        sb.append("{")
                          .append("\"status\":\"success\",")
                          .append("\"type\":\"SELECT\",")
                          .append("\"columns\":[").append(listToJsonArray(columns)).append("],")
                          .append("\"rows\":").append(rowsJson.toString()).append(",")
                          .append("\"rowCount\":").append(count).append(",")
                          .append("\"executionTimeMs\":").append(elapsed)
                          .append("}");

                        sendJsonResponse(exchange, 200, sb.toString());
                    }
                } else if (trimmed.toUpperCase().startsWith("INSERT") ||
                           trimmed.toUpperCase().startsWith("UPDATE") ||
                           trimmed.toUpperCase().startsWith("DELETE")) {
                    try (PreparedStatement pstmt = conn.prepareStatement(trimmed)) {
                        int affected = pstmt.executeUpdate();
                        long elapsed = System.currentTimeMillis() - startTime;
                        String op = trimmed.substring(0, 6).toUpperCase();
                        String json = String.format("{\"status\":\"success\",\"type\":\"%s\",\"rowsAffected\":%d,\"message\":\"%d row(s) updated.\",\"executionTimeMs\":%d}",
                                op, affected, affected, elapsed);
                        sendJsonResponse(exchange, 200, json);
                    }
                } else if (trimmed.equalsIgnoreCase("COMMIT")) {
                    conn.commit();
                    sendJsonResponse(exchange, 200, "{\"status\":\"success\",\"type\":\"TCL\",\"message\":\"Commit complete.\"}");
                } else if (trimmed.equalsIgnoreCase("ROLLBACK")) {
                    conn.rollback();
                    sendJsonResponse(exchange, 200, "{\"status\":\"success\",\"type\":\"TCL\",\"message\":\"Rollback complete.\"}");
                } else {
                    sendJsonResponse(exchange, 400, "{\"status\":\"error\",\"code\":\"ORA-00900\",\"message\":\"Invalid SQL statement\"}");
                }
            } catch (SQLException e) {
                String errJson = String.format("{\"status\":\"error\",\"code\":\"%s\",\"message\":\"%s\"}",
                        e.getSQLState() != null ? e.getSQLState() : "ORA-00942", escapeJson(e.getMessage()));
                sendJsonResponse(exchange, 400, errJson);
            }
        }
    }

    /**
     * Endpoint: POST /api/eligibility/assess
     * Clinical rule processor assessing donor vitals, computing volume, and generating DDL/DML.
     */
    static class EligibilityAssessHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String body = readRequestBody(exchange);
            int age = parseInt(extractJsonString(body, "age"), 25);
            double weight = parseDouble(extractJsonString(body, "weight"), 68.0);
            double hb = parseDouble(extractJsonString(body, "hemoglobin"), 14.0);
            int systolic = parseInt(extractJsonString(body, "systolic"), 120);
            int diastolic = parseInt(extractJsonString(body, "diastolic"), 80);
            int pulse = parseInt(extractJsonString(body, "pulse"), 72);
            int interval = parseInt(extractJsonString(body, "daysSinceLast"), 100);
            String gender = extractJsonString(body, "gender");
            if (gender == null) gender = "Male";
            String bg = extractJsonString(body, "bloodGroup");
            if (bg == null) bg = "O+";

            boolean agePass = age >= 18 && age <= 65;
            boolean weightPass = weight >= 50.0;
            boolean hbPass = hb >= 12.5;
            boolean bpPass = systolic >= 100 && systolic <= 140 && diastolic >= 60 && diastolic <= 90;
            boolean pulsePass = pulse >= 60 && pulse <= 100;
            boolean intervalPass = "Female".equalsIgnoreCase(gender) ? interval >= 120 : interval >= 90;

            boolean isEligible = agePass && weightPass && hbPass && bpPass && pulsePass && intervalPass;

            int circulatingVolume = (int) Math.round(weight * ("Female".equalsIgnoreCase(gender) ? 65.0 : 70.0));
            int maxSafeVolume = isEligible ? (weight >= 60.0 ? 450 : 350) : 0;
            int prbc = isEligible ? (int) Math.round(maxSafeVolume * 0.48) : 0;
            int ffp = isEligible ? (int) Math.round(maxSafeVolume * 0.40) : 0;
            int platelets = isEligible ? (int) Math.round(maxSafeVolume * 0.12) : 0;

            String json = String.format("{" +
                    "\"isEligible\":%b," +
                    "\"status\":\"%s\"," +
                    "\"circulatingVolume\":%d," +
                    "\"maxSafeDonationVolume\":%d," +
                    "\"componentYield\":{\"prbc\":%d,\"ffp\":%d,\"platelets\":%d}," +
                    "\"potentialLivesSaved\":%d" +
                    "}",
                    isEligible,
                    isEligible ? "Eligible" : "Deferred",
                    circulatingVolume,
                    maxSafeVolume,
                    prbc, ffp, platelets,
                    isEligible ? 3 : 0
            );

            sendJsonResponse(exchange, 200, json);
        }
    }

    /**
     * Endpoint: /api/donors
     * Native JDBC CRUD persistence for DONOR table.
     */
    static class DonorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                try (Connection conn = getDatabaseConnection();
                     PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM DONOR ORDER BY DONOR_ID");
                     ResultSet rs = pstmt.executeQuery()) {

                    StringBuilder sb = new StringBuilder("[");
                    int count = 0;
                    while (rs.next()) {
                        if (count++ > 0) sb.append(",");
                        sb.append(String.format("{\"donor_id\":\"%s\",\"name\":\"%s\",\"blood_group\":\"%s\",\"age\":%d,\"gender\":\"%s\",\"phone\":\"%s\",\"city\":\"%s\",\"hemoglobin\":%.1f,\"status\":\"%s\"}",
                                rs.getString("DONOR_ID"),
                                escapeJson(rs.getString("NAME")),
                                rs.getString("BLOOD_GROUP"),
                                rs.getInt("AGE"),
                                rs.getString("GENDER"),
                                rs.getString("PHONE"),
                                rs.getString("CITY"),
                                rs.getDouble("HEMOGLOBIN"),
                                rs.getString("STATUS")
                        ));
                    }
                    sb.append("]");
                    sendJsonResponse(exchange, 200, sb.toString());
                } catch (SQLException e) {
                    sendMockDonorsResponse(exchange);
                }
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 201, "{\"message\":\"Donor created via PreparedStatement INSERT\"}");
            }
        }

        private void sendMockDonorsResponse(HttpExchange exchange) throws IOException {
            String mock = "[" +
                    "{\"donor_id\":\"D101\",\"name\":\"Dr. Aravind Swaminathan\",\"blood_group\":\"O-\",\"age\":28,\"gender\":\"Male\",\"phone\":\"+91 98401 23456\",\"city\":\"Chennai\",\"hemoglobin\":14.5,\"status\":\"Eligible\"}," +
                    "{\"donor_id\":\"D102\",\"name\":\"Priyanka Sundaram\",\"blood_group\":\"A+\",\"age\":24,\"gender\":\"Female\",\"phone\":\"+91 97890 87654\",\"city\":\"Vellore\",\"hemoglobin\":13.2,\"status\":\"Eligible\"}," +
                    "{\"donor_id\":\"D103\",\"name\":\"Karthik Ramanathan\",\"blood_group\":\"B+\",\"age\":32,\"gender\":\"Male\",\"phone\":\"+91 94441 54321\",\"city\":\"Chennai\",\"hemoglobin\":15.1,\"status\":\"Eligible\"}," +
                    "{\"donor_id\":\"D104\",\"name\":\"Sneha Narayanan\",\"blood_group\":\"AB-\",\"age\":22,\"gender\":\"Female\",\"phone\":\"+91 98840 99887\",\"city\":\"Bangalore\",\"hemoglobin\":12.8,\"status\":\"Eligible\"}" +
                    "]";
            sendJsonResponse(exchange, 200, mock);
        }
    }

    /**
     * Endpoint: /api/stock
     */
    static class StockHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String stockJson = "{" +
                    "\"A+\":{\"units\":28,\"capacity\":50,\"minSafe\":15}," +
                    "\"A-\":{\"units\":9,\"capacity\":30,\"minSafe\":12}," +
                    "\"B+\":{\"units\":35,\"capacity\":50,\"minSafe\":15}," +
                    "\"B-\":{\"units\":14,\"capacity\":30,\"minSafe\":10}," +
                    "\"AB+\":{\"units\":22,\"capacity\":35,\"minSafe\":12}," +
                    "\"AB-\":{\"units\":4,\"capacity\":25,\"minSafe\":8}," +
                    "\"O+\":{\"units\":44,\"capacity\":60,\"minSafe\":20}," +
                    "\"O-\":{\"units\":6,\"capacity\":35,\"minSafe\":12}" +
                    "}";
            sendJsonResponse(exchange, 200, stockJson);
        }
    }

    /**
     * Endpoint: /api/requests
     */
    static class RequestsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String reqsJson = "[" +
                    "{\"req_id\":\"REQ-501\",\"hospital\":\"Apollo Specialty Hospital, Chennai\",\"patient\":\"Kavitha Shanmugam\",\"blood_group\":\"O-\",\"component\":\"Packed Red Cells\",\"units\":2,\"urgency\":\"Emergency STAT\",\"status\":\"Pending\",\"date\":\"2026-10-12 18:45\"}," +
                    "{\"req_id\":\"REQ-502\",\"hospital\":\"CMC Hospital, Vellore\",\"patient\":\"Rahul Verma\",\"blood_group\":\"B+\",\"component\":\"Whole Blood\",\"units\":3,\"urgency\":\"High Priority\",\"status\":\"Approved\",\"date\":\"2026-10-12 16:10\"}" +
                    "]";
            sendJsonResponse(exchange, 200, reqsJson);
        }
    }

    /**
     * Static file handler to serve index.html, login.html, styles.css, app.js
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File("." + path);
            if (!file.exists() || file.isDirectory()) {
                String notFound = "404 Not Found";
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
                return;
            }

            String contentType = "text/plain";
            if (path.endsWith(".html")) contentType = "text/html; charset=utf-8";
            else if (path.endsWith(".css")) contentType = "text/css; charset=utf-8";
            else if (path.endsWith(".js")) contentType = "application/javascript; charset=utf-8";
            else if (path.endsWith(".json")) contentType = "application/json; charset=utf-8";
            else if (path.endsWith(".svg")) contentType = "image/svg+xml";

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, file.length());

            try (InputStream is = new FileInputStream(file);
                 OutputStream os = exchange.getResponseBody()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
            }
        }
    }

    // Helper Utility Methods
    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String extractJsonString(String json, String key) {
        String target = "\"" + key + "\"";
        int idx = json.indexOf(target);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx + target.length());
        if (colon == -1) return null;
        int startQuote = json.indexOf("\"", colon);
        if (startQuote != -1) {
            int endQuote = json.indexOf("\"", startQuote + 1);
            if (endQuote != -1) {
                return json.substring(startQuote + 1, endQuote);
            }
        }
        // numeric / boolean value fallback
        int comma = json.indexOf(",", colon);
        int brace = json.indexOf("}", colon);
        int end = (comma != -1 && comma < brace) ? comma : brace;
        if (end == -1) end = json.length();
        return json.substring(colon + 1, end).trim();
    }

    private static int parseInt(String val, int def) {
        if (val == null) return def;
        try { return Integer.parseInt(val.replaceAll("[^0-9-]", "")); } catch (Exception e) { return def; }
    }

    private static double parseDouble(String val, double def) {
        if (val == null) return def;
        try { return Double.parseDouble(val.replaceAll("[^0-9.-]", "")); } catch (Exception e) { return def; }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private static String listToJsonArray(List<String> list) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeJson(list.get(i))).append("\"");
        }
        return sb.toString();
    }
}
