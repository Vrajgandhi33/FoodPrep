"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function NutritionTracker({ session }) {
  const [nutritionData, setNutritionData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    fetchNutritionData()
    fetchWeeklyData()
  }, [session, selectedDate])

  const fetchNutritionData = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select(`
          *,
          recipes (
            name,
            calories,
            category
          )
        `)
        .eq("user_id", session.user.id)
        .eq("date", selectedDate)

      if (error) throw error
      setNutritionData(data || [])
    } catch (error) {
      console.error("Error fetching nutrition data:", error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week

      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6) // End of week

      const { data, error } = await supabase
        .from("meal_plans")
        .select(`
          date,
          recipes (
            calories
          )
        `)
        .eq("user_id", session.user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])

      if (error) throw error

      // Group by date and calculate daily totals
      const dailyTotals = {}
      data.forEach((meal) => {
        if (!dailyTotals[meal.date]) {
          dailyTotals[meal.date] = 0
        }
        dailyTotals[meal.date] += meal.recipes?.calories || 0
      })

      setWeeklyData(dailyTotals)
    } catch (error) {
      console.error("Error fetching weekly data:", error)
    }
  }

  const getTotalCalories = () => {
    return nutritionData.reduce((total, meal) => {
      return total + (meal.recipes?.calories || 0)
    }, 0)
  }

  const getMealsByType = (mealType) => {
    return nutritionData.filter((meal) => meal.meal_type === mealType)
  }

  const getCaloriesByMealType = (mealType) => {
    return getMealsByType(mealType).reduce((total, meal) => {
      return total + (meal.recipes?.calories || 0)
    }, 0)
  }

  const getWeeklyAverage = () => {
    const values = Object.values(weeklyData)
    if (values.length === 0) return 0
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
  }

  const getCalorieGoal = () => 2000 // Default goal, could be user-configurable

  const getCalorieProgress = () => {
    const total = getTotalCalories()
    const goal = getCalorieGoal()
    return Math.min((total / goal) * 100, 100)
  }

  return (
    <div className="nutrition-tracker">
      <div className="nutrition-header">
        <h2>Nutrition Tracker</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      <div className="nutrition-overview">
        <div className="calorie-goal-card">
          <h3>Daily Calorie Goal</h3>
          <div className="calorie-progress">
            <div className="progress-circle">
              <div className="progress-fill" style={{ "--progress": `${getCalorieProgress()}%` }}></div>
              <div className="progress-text">
                <span className="current">{getTotalCalories()}</span>
                <span className="goal">/ {getCalorieGoal()}</span>
              </div>
            </div>
          </div>
          <p className="progress-label">
            {getTotalCalories() >= getCalorieGoal()
              ? "Goal Reached!"
              : `${getCalorieGoal() - getTotalCalories()} calories remaining`}
          </p>
        </div>

        <div className="nutrition-stats">
          <div className="stat-item">
            <h4>Weekly Average</h4>
            <p>{getWeeklyAverage()} cal/day</p>
          </div>
          <div className="stat-item">
            <h4>Meals Today</h4>
            <p>{nutritionData.length} meals</p>
          </div>
        </div>
      </div>

      <div className="meal-breakdown">
        <h3>Meal Breakdown</h3>
        <div className="breakdown-grid">
          {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
            <div key={mealType} className="meal-breakdown-card">
              <h4>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
              <div className="meal-calories">{getCaloriesByMealType(mealType)} cal</div>
              <div className="meal-count">{getMealsByType(mealType).length} items</div>
              <div className="meal-items">
                {getMealsByType(mealType).map((meal) => (
                  <div key={meal.id} className="meal-item-small">
                    {meal.recipes?.name} ({meal.recipes?.calories} cal)
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="weekly-chart">
        <h3>Weekly Overview</h3>
        <div className="chart-container">
          {Object.entries(weeklyData).map(([date, calories]) => (
            <div key={date} className="chart-bar">
              <div
                className="bar"
                style={{
                  height: `${Math.max((calories / getCalorieGoal()) * 100, 5)}%`,
                  backgroundColor: calories >= getCalorieGoal() ? "#4CAF50" : "#2196F3",
                }}
              ></div>
              <div className="bar-label">
                <div className="bar-date">{new Date(date).toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="bar-calories">{calories}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {nutritionData.length === 0 && (
        <div className="empty-state">
          <h3>No meals tracked for this date</h3>
          <p>Add meals to your meal planner to track your nutrition!</p>
        </div>
      )}
    </div>
  )
}
