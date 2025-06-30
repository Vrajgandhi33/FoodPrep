"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import Auth from "../components/Auth"
import Dashboard from "../components/Dashboard"
import RecipeManager from "../components/RecipeManager"
import MealPlanner from "../components/MealPlanner"
import ShoppingList from "../components/ShoppingList"
import NutritionTracker from "../components/NutritionTracker"

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading FoodPrep...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard session={session} />
      case "recipes":
        return <RecipeManager session={session} />
      case "meal-planner":
        return <MealPlanner session={session} />
      case "shopping-list":
        return <ShoppingList session={session} />
      case "nutrition":
        return <NutritionTracker session={session} />
      default:
        return <Dashboard session={session} />
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🍽️ FoodPrep</h1>
          <div className="user-info">
            <span>Welcome, {session.user.email}</span>
            <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === "recipes" ? "active" : ""}`}
          onClick={() => setActiveTab("recipes")}
        >
          📝 Recipes
        </button>
        <button
          className={`nav-btn ${activeTab === "meal-planner" ? "active" : ""}`}
          onClick={() => setActiveTab("meal-planner")}
        >
          📅 Meal Planner
        </button>
        <button
          className={`nav-btn ${activeTab === "shopping-list" ? "active" : ""}`}
          onClick={() => setActiveTab("shopping-list")}
        >
          🛒 Shopping List
        </button>
        <button
          className={`nav-btn ${activeTab === "nutrition" ? "active" : ""}`}
          onClick={() => setActiveTab("nutrition")}
        >
          🥗 Nutrition
        </button>
      </nav>

      <main className="app-main">{renderActiveComponent()}</main>
    </div>
  )
}
