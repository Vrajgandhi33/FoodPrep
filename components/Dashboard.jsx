"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    plannedMeals: 0,
    shoppingItems: 0,
    weeklyCalories: 0,
  })
  const [recentRecipes, setRecentRecipes] = useState([])
  const [todaysMeals, setTodaysMeals] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [session])

  const fetchDashboardData = async () => {
    try {
      // Fetch recipes count
      const { count: recipesCount } = await supabase
        .from("recipes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)

      // Fetch recent recipes
      const { data: recipes } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch today's meals
      const today = new Date().toISOString().split("T")[0]
      const { data: meals } = await supabase
        .from("meal_plans")
        .select("*, recipes(*)")
        .eq("user_id", session.user.id)
        .eq("date", today)

      // Fetch shopping list items count
      const { count: shoppingCount } = await supabase
        .from("shopping_list")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("completed", false)

      setStats({
        totalRecipes: recipesCount || 0,
        plannedMeals: meals?.length || 0,
        shoppingItems: shoppingCount || 0,
        weeklyCalories: 0, // Calculate based on meal plans
      })

      setRecentRecipes(recipes || [])
      setTodaysMeals(meals || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's your meal prep overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalRecipes}</h3>
            <p>Total Recipes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.plannedMeals}</h3>
            <p>Today's Meals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{stats.shoppingItems}</h3>
            <p>Shopping Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.weeklyCalories}</h3>
            <p>Weekly Calories</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Recent Recipes</h3>
          <div className="recipe-list">
            {recentRecipes.length > 0 ? (
              recentRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-item">
                  <div className="recipe-info">
                    <h4>{recipe.name}</h4>
                    <p>
                      {recipe.prep_time} min • {recipe.servings} servings
                    </p>
                  </div>
                  <div className="recipe-calories">{recipe.calories} cal</div>
                </div>
              ))
            ) : (
              <p className="empty-state">No recipes yet. Create your first recipe!</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Today's Meals</h3>
          <div className="meals-list">
            {todaysMeals.length > 0 ? (
              todaysMeals.map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-time">{meal.meal_type}</div>
                  <div className="meal-recipe">{meal.recipes ? meal.recipes.name : "Recipe not found"}</div>
                </div>
              ))
            ) : (
              <p className="empty-state">No meals planned for today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
