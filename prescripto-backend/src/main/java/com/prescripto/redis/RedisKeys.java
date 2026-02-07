package com.prescripto.redis;

public class RedisKeys {

    public static final String ADMIN_DASHBOARD = "admin:dashboard";
    public static final String DOCTORS_LIST = "doctors:list";

    public static String doctorDashboard(String docId) {
        return "doctor:dashboard:" + docId;
    }

    public static String doctorProfile(String docId) {
        return "doctor:profile:" + docId;
    }

    public static String doctorSlots(String docId, String date) {
        return "doctor:slots:" + docId + ":" + date;
    }

    public static String userProfile(String userId) {
        return "user:profile:" + userId;
    }

    public static String userAppointments(String userId) {
        return "user:appointments:" + userId;
    }

    public static String slotLock(String docId, String date, String time) {
        return "lock:slot:" + docId + ":" + date + ":" + time;
    }
}
