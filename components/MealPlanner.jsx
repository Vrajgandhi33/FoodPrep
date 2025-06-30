"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function MealPlanner({ session }) {
  const [mealPlans, setMealPlans] = useState([])
  const [recipes, setRecipes] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState("breakfast")
  const [selectedRecipe, setSelectedRecipe] = useState("")

  useEffect(() => {
    fetchRecipes()
    fetchMealPlans()
  }, [session, selectedDate])

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase.from("recipes").select("*").eq("user_id", session.user.id).order("name")

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error("Error fetching recipes:", error)
    }
  }

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select(`
          *,
          recipes (
            id,
            name,
            calories,
            prep_time,
            cook_time
          )
        `)
        .eq("user_id", session.user.id)
        .eq("date", selectedDate)
        .order("meal_type")

      if (error) throw error
      setMealPlans(data || [])
    } catch (error) {
      console.error("Error fetching meal plans:", error)
    }
  }

  const handleAddMeal = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("meal_plans").insert([
        {
          user_id: session.user.id,
          recipe_id: selectedRecipe,
          date: selectedDate,
          meal_type: selectedMealType,
        },
      ])

      if (error) throw error

      setShowAddMeal(false)
      setSelectedRecipe("")
      fetchMealPlans()
    } catch (error) {
      console.error("Error adding meal:", error)
      alert("Error adding meal to plan")
    }
  }

  const handleDeleteMeal = async (mealId) => {
    try {
      const { error } = await supabase.from("meal_plans").delete().eq("id", mealId)

      if (error) throw error
      fetchMealPlans()
    } catch (error) {
      console.error("Error deleting meal:", error)
    }
  }

  const getMealsByType = (mealType) => {
    return mealPlans.filter((meal) => meal.meal_type === mealType)
  }

  const getTotalCalories = () => {
    return mealPlans.reduce((total, meal) => {
      return total + (meal.recipes?.calories || 0)
    }, 0)
  }

  const generateShoppingList = async () => {
    try {
      // Get all recipes for the selected date
      const recipeIds = mealPlans.map((meal) => meal.recipe_id)

      if (recipeIds.length === 0) {
        alert("No meals planned for this date")
        return
      }

      const { data: recipesData, error } = await supabase.from("recipes").select("ingredients").in("id", recipeIds)

      if (error) throw error

      // Parse ingredients and add to shopping list
      const allIngredients = []
      recipesData.forEach((recipe) => {
        const ingredients = recipe.ingredients.split("\n").filter((ing) => ing.trim())
        allIngredients.push(...ingredients)
      })

      // Add unique ingredients to shopping list
      const uniqueIngredients = [...new Set(allIngredients)]

      for (const ingredient of uniqueIngredients) {
        await supabase.from("shopping_list").upsert(
          [
            {
              user_id: session.user.id,
              item: ingredient.trim(),
              completed: false,
            },
          ],
          { onConflict: "user_id,item" },
        )
      }

      alert(`Added ${uniqueIngredients.length} items to shopping list!`)
    } catch (error) {
      console.error("Error generating shopping list:", error)
      alert("Error generating shopping list")
    }
  }

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <h2>Meal Planner</h2>
        <div className="planner-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button className="primary-btn" onClick={() => setShowAddMeal(true)}>
            Add Meal
          </button>
          <button className="secondary-btn" onClick={generateShoppingList}>
            Generate Shopping List
          </button>
        </div>
      </div>

      <div className="daily-summary">
        <div className="summary-card">
          <h3>Daily Summary</h3>
          <p>
            Total Calories: <strong>{getTotalCalories()}</strong>
          </p>
          <p>
            Meals Planned: <strong>{mealPlans.length}</strong>
          </p>
        </div>
      </div>

      {showAddMeal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Meal to Plan</h3>
              <button className="close-btn" onClick={() => setShowAddMeal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddMeal} className="add-meal-form">
              <div className="form-group">
                <label>Meal Type</label>
                <select value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value)}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="form-group">
                <label>Recipe</label>
                <select value={selectedRecipe} onChange={(e) => setSelectedRecipe(e.target.value)} required>
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.calories} cal)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowAddMeal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="meals-timeline">
        {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
          <div key={mealType} className="meal-section">
            <h3 className="meal-type-header">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>

            <div className="meal-items">
              {getMealsByType(mealType).map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-info">
                    <h4>{meal.recipes?.name || "Recipe not found"}</h4>
                    <p>{meal.recipes?.calories || 0} calories</p>
                    <p>⏱️ {(meal.recipes?.prep_time || 0) + (meal.recipes?.cook_time || 0)} min</p>
                  </div>
                  <button className="delete-btn" onClick={() => handleDeleteMeal(meal.id)}>
                    Remove
                  </button>
                </div>
              ))}

              {getMealsByType(mealType).length === 0 && (
                <div className="empty-meal">
                  <p>No {mealType} planned</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
