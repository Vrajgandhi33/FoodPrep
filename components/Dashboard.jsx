"use client";

import { useState, useEffect } from "react";

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    plannedMeals: 0,
    shoppingItems: 0,
    weeklyCalories: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats here
    // This is a placeholder - implement actual data fetching
    setStats({
      totalRecipes: 12,
      plannedMeals: 5,
      shoppingItems: 8,
      weeklyCalories: 14500,
    });
  }, [session]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back!</h2>
        <p>Here's your meal prep overview for today</p>
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
            <p>Planned Meals</p>
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
          <div className="empty-state">
            <p>No recipes yet. Create your first recipe!</p>
          </div>
        </div>
        <div className="dashboard-section">
          <h3>Today's Meals</h3>
          <div className="empty-state">
            <p>No meals planned for today. Start planning!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
