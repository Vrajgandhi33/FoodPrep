"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function RecipeManager({ session }) {
  const [recipes, setRecipes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    instructions: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    calories: "",
    category: "main",
  })

  useEffect(() => {
    fetchRecipes()
  }, [session])

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error("Error fetching recipes:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const recipeData = {
        ...formData,
        user_id: session.user.id,
        prep_time: Number.parseInt(formData.prep_time),
        cook_time: Number.parseInt(formData.cook_time),
        servings: Number.parseInt(formData.servings),
        calories: Number.parseInt(formData.calories),
      }

      if (editingRecipe) {
        const { error } = await supabase.from("recipes").update(recipeData).eq("id", editingRecipe.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("recipes").insert([recipeData])

        if (error) throw error
      }

      resetForm()
      fetchRecipes()
    } catch (error) {
      console.error("Error saving recipe:", error)
      alert("Error saving recipe")
    }
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prep_time.toString(),
      cook_time: recipe.cook_time.toString(),
      servings: recipe.servings.toString(),
      calories: recipe.calories.toString(),
      category: recipe.category,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      try {
        const { error } = await supabase.from("recipes").delete().eq("id", id)

        if (error) throw error
        fetchRecipes()
      } catch (error) {
        console.error("Error deleting recipe:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      instructions: "",
      prep_time: "",
      cook_time: "",
      servings: "",
      calories: "",
      category: "main",
    })
    setEditingRecipe(null)
    setShowForm(false)
  }

  return (
    <div className="recipe-manager">
      <div className="section-header">
        <h2>Recipe Manager</h2>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          Add New Recipe
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingRecipe ? "Edit Recipe" : "Add New Recipe"}</h3>
              <button className="close-btn" onClick={resetForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="recipe-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Recipe Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Ingredients (one per line)</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows="6"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cook Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.cook_time}
                    onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Servings</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Calories per serving</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingRecipe ? "Update Recipe" : "Save Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-header">
              <h3>{recipe.name}</h3>
              <div className="recipe-actions">
                <button className="edit-btn" onClick={() => handleEdit(recipe)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(recipe.id)}>
                  Delete
                </button>
              </div>
            </div>

            <p className="recipe-description">{recipe.description}</p>

            <div className="recipe-meta">
              <span className="recipe-time">⏱️ {recipe.prep_time + recipe.cook_time} min</span>
              <span className="recipe-servings">👥 {recipe.servings} servings</span>
              <span className="recipe-calories">🔥 {recipe.calories} cal</span>
            </div>

            <div className="recipe-category">
              <span className={`category-tag ${recipe.category}`}>{recipe.category}</span>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="empty-state">
          <h3>No recipes yet</h3>
          <p>Start building your recipe collection by adding your first recipe!</p>
        </div>
      )}
    </div>
  )
}
