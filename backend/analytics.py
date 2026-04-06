import sqlite3
from database import get_connection


# ----------------------------
# DAILY ANALYTICS
# ----------------------------
def get_daily_analytics(userID):
    conn = get_connection()
    cursor = conn.cursor()

    # Tasks completed per day
    cursor.execute("""
        SELECT DATE(completionDate) as date, COUNT(*) as tasks_completed
        FROM goal_tasks
        WHERE status='Completed'
        GROUP BY date
    """)
    
    daily_data = []
    for row in cursor.fetchall():
        daily_data.append({
            "date": row[0],
            "tasks_completed": row[1],
            "total_focus_time": 0
        })

    conn.close()
    return daily_data


# ----------------------------
# WEEKLY ANALYTICS
# ----------------------------
def get_weekly_analytics(userID):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            strftime('%Y-%W', sessionDate) as week,
            SUM(workDuration) as total_focus_time
        FROM pomodoro_sessions
        WHERE userID=?
        GROUP BY week
    """, (userID,))

    weekly_data = []
    for row in cursor.fetchall():
        weekly_data.append({
            "week": row[0],
            "total_focus_time": row[1] or 0
        })

    conn.close()
    return weekly_data


# ----------------------------
# SUMMARY ANALYTICS
# ----------------------------
def get_summary(userID):
    conn = get_connection()
    cursor = conn.cursor()

    # Total tasks completed
    cursor.execute("""
        SELECT COUNT(*) FROM goal_tasks 
        WHERE status='Completed'
    """)
    tasks_completed = cursor.fetchone()[0]

    # Total focus time
    cursor.execute("""
        SELECT SUM(workDuration) FROM pomodoro_sessions
        WHERE userID=?
    """, (userID,))
    focus_time = cursor.fetchone()[0] or 0

    # Pending tasks
    cursor.execute("""
        SELECT COUNT(*) FROM todo_tasks
        WHERE userID=? AND status='Pending'
    """, (userID,))
    pending_tasks = cursor.fetchone()[0]

    # Completed goals
    cursor.execute("""
        SELECT COUNT(*) FROM goals
        WHERE userID=? AND status='Completed'
    """, (userID,))
    goals_completed = cursor.fetchone()[0]

    conn.close()

    return {
        "tasksCompleted": tasks_completed,
        "pendingTasks": pending_tasks,
        "goalsCompleted": goals_completed,
        "totalFocusTime": focus_time
    }
