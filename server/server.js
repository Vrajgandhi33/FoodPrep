const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware - Updated CORS configuration
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}))

app.use(express.json())

// Add a preflight handler for all routes
app.options('*', cors())

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Helper function to verify user
const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" })
  }
}

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "FoodPrep API is running" })
})

// Recipes CRUD
app.get("/api/recipes", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/recipes", verifyUser, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      user_id: req.user.id,
    }

    const { data, error } = await supabase.from("recipes").insert([recipeData]).select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/recipes/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("recipes")
      .update(req.body)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()

    if (error) throw error

    if (data.length === 0) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/recipes/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", req.user.id)

    if (error) throw error
    res.json({ message: "Recipe deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Meal Plans CRUD
app.get("/api/meal-plans", verifyUser, async (req, res) => {
  try {
    const { date } = req.query
    let query = supabase
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
      .eq("user_id", req.user.id)

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("meal_type")

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/meal-plans", verifyUser, async (req, res) => {
  try {
    const mealPlanData = {
      ...req.body,
      user_id: req.user.id,
    }

    const { data, error } = await supabase.from("meal_plans").insert([mealPlanData]).select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/meal-plans/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from("meal_plans").delete().eq("id", id).eq("user_id", req.user.id)

    if (error) throw error
    res.json({ message: "Meal plan deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Shopping List CRUD
app.get("/api/shopping-list", verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/shopping-list", verifyUser, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      user_id: req.user.id,
    }

    const { data, error } = await supabase.from("shopping_list").insert([itemData]).select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/shopping-list/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from("shopping_list")
      .update(req.body)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()

    if (error) throw error

    if (data.length === 0) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/shopping-list/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from("shopping_list").delete().eq("id", id).eq("user_id", req.user.id)

    if (error) throw error
    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Nutrition Analytics
app.get("/api/nutrition/daily", verifyUser, async (req, res) => {
  try {
    const { date } = req.query
    const { data, error } = await supabase
      .from("meal_plans")
      .select(`
        meal_type,
        recipes (
          name,
          calories,
          category
        )
      `)
      .eq("user_id", req.user.id)
      .eq("date", date || new Date().toISOString().split("T")[0])

    if (error) throw error

    const nutrition = {
      totalCalories: data.reduce((sum, meal) => sum + (meal.recipes?.calories || 0), 0),
      mealBreakdown: {
        breakfast: data
          .filter((m) => m.meal_type === "breakfast")
          .reduce((sum, meal) => sum + (meal.recipes?.calories || 0), 0),
        lunch: data
          .filter((m) => m.meal_type === "lunch")
          .reduce((sum, meal) => sum + (meal.recipes?.calories || 0), 0),
        dinner: data
          .filter((m) => m.meal_type === "dinner")
          .reduce((sum, meal) => sum + (meal.recipes?.calories || 0), 0),
        snack: data
          .filter((m) => m.meal_type === "snack")
          .reduce((sum, meal) => sum + (meal.recipes?.calories || 0), 0),
      },
      meals: data,
    }

    res.json(nutrition)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/nutrition/weekly", verifyUser, async (req, res) => {
  try {
    const { startDate } = req.query
    const start = new Date(startDate || new Date())
    start.setDate(start.getDate() - start.getDay()) // Start of week

    const end = new Date(start)
    end.setDate(end.getDate() + 6) // End of week

    const { data, error } = await supabase
      .from("meal_plans")
      .select(`
        date,
        recipes (
          calories
        )
      `)
      .eq("user_id", req.user.id)
      .gte("date", start.toISOString().split("T")[0])
      .lte("date", end.toISOString().split("T")[0])

    if (error) throw error

    // Group by date
    const dailyTotals = {}
    data.forEach((meal) => {
      if (!dailyTotals[meal.date]) {
        dailyTotals[meal.date] = 0
      }
      dailyTotals[meal.date] += meal.recipes?.calories || 0
    })

    res.json(dailyTotals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Generate Shopping List from Meal Plans
app.post("/api/shopping-list/generate", verifyUser, async (req, res) => {
  try {
    const { date } = req.body

    // Get meal plans for the date
    const { data: mealPlans, error: mealError } = await supabase
      .from("meal_plans")
      .select(`
        recipes (
          ingredients
        )
      `)
      .eq("user_id", req.user.id)
      .eq("date", date)

    if (mealError) throw mealError

    if (mealPlans.length === 0) {
      return res.status(400).json({ error: "No meals planned for this date" })
    }

    // Extract and process ingredients
    const allIngredients = []
    mealPlans.forEach((meal) => {
      if (meal.recipes?.ingredients) {
        const ingredients = meal.recipes.ingredients.split("\n").filter((ing) => ing.trim())
        allIngredients.push(...ingredients)
      }
    })

    // Remove duplicates
    const uniqueIngredients = [...new Set(allIngredients)]

    // Add to shopping list
    const shoppingItems = uniqueIngredients.map((ingredient) => ({
      user_id: req.user.id,
      item: ingredient.trim(),
      completed: false,
    }))

    const { data, error } = await supabase
      .from("shopping_list")
      .upsert(shoppingItems, { onConflict: "user_id,item" })
      .select()

    if (error) throw error

    res.json({
      message: `Added ${uniqueIngredients.length} items to shopping list`,
      items: data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Dashboard Stats
app.get("/api/dashboard/stats", verifyUser, async (req, res) => {
  try {
    // Get recipes count
    const { count: recipesCount } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)

    // Get today's meals count
    const today = new Date().toISOString().split("T")[0]
    const { count: todayMealsCount } = await supabase
      .from("meal_plans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .eq("date", today)

    // Get pending shopping items count
    const { count: shoppingItemsCount } = await supabase
      .from("shopping_list")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .eq("completed", false)

    // Get recent recipes
    const { data: recentRecipes } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get today's meals
    const { data: todaysMeals } = await supabase
      .from("meal_plans")
      .select(`
        *,
        recipes (
          name,
          calories
        )
      `)
      .eq("user_id", req.user.id)
      .eq("date", today)

    res.json({
      stats: {
        totalRecipes: recipesCount || 0,
        plannedMeals: todayMealsCount || 0,
        shoppingItems: shoppingItemsCount || 0,
        weeklyCalories: 0, // Could be calculated from weekly meal plans
      },
      recentRecipes: recentRecipes || [],
      todaysMeals: todaysMeals || [],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`FoodPrep API server running on port ${PORT}`)
})

module.exports = app
