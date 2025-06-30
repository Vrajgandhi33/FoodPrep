"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function ShoppingList({ session }) {
  const [shoppingItems, setShoppingItems] = useState([])
  const [newItem, setNewItem] = useState("")
  const [filter, setFilter] = useState("all") // all, pending, completed

  useEffect(() => {
    fetchShoppingList()
  }, [session])

  const fetchShoppingList = async () => {
    try {
      const { data, error } = await supabase
        .from("shopping_list")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setShoppingItems(data || [])
    } catch (error) {
      console.error("Error fetching shopping list:", error)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()

    if (!newItem.trim()) return

    try {
      const { error } = await supabase.from("shopping_list").insert([
        {
          user_id: session.user.id,
          item: newItem.trim(),
          completed: false,
        },
      ])

      if (error) throw error

      setNewItem("")
      fetchShoppingList()
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Error adding item to shopping list")
    }
  }

  const handleToggleComplete = async (id, completed) => {
    try {
      const { error } = await supabase.from("shopping_list").update({ completed: !completed }).eq("id", id)

      if (error) throw error
      fetchShoppingList()
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      const { error } = await supabase.from("shopping_list").delete().eq("id", id)

      if (error) throw error
      fetchShoppingList()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleClearCompleted = async () => {
    if (confirm("Clear all completed items?")) {
      try {
        const { error } = await supabase
          .from("shopping_list")
          .delete()
          .eq("user_id", session.user.id)
          .eq("completed", true)

        if (error) throw error
        fetchShoppingList()
      } catch (error) {
        console.error("Error clearing completed items:", error)
      }
    }
  }

  const filteredItems = shoppingItems.filter((item) => {
    if (filter === "pending") return !item.completed
    if (filter === "completed") return item.completed
    return true
  })

  const completedCount = shoppingItems.filter((item) => item.completed).length
  const totalCount = shoppingItems.length

  return (
    <div className="shopping-list">
      <div className="shopping-header">
        <h2>Shopping List</h2>
        <div className="shopping-stats">
          <span>
            {completedCount}/{totalCount} completed
          </span>
        </div>
      </div>

      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          className="item-input"
        />
        <button type="submit" className="add-btn">
          Add
        </button>
      </form>

      <div className="shopping-controls">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All ({totalCount})
          </button>
          <button className={`filter-btn ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
            Pending ({totalCount - completedCount})
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>

        {completedCount > 0 && (
          <button className="clear-btn" onClick={handleClearCompleted}>
            Clear Completed
          </button>
        )}
      </div>

      <div className="shopping-items">
        {filteredItems.map((item) => (
          <div key={item.id} className={`shopping-item ${item.completed ? "completed" : ""}`}>
            <div className="item-content">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleComplete(item.id, item.completed)}
                className="item-checkbox"
              />
              <span className="item-text">{item.item}</span>
            </div>

            <button className="delete-item-btn" onClick={() => handleDeleteItem(item.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <h3>
            {filter === "all"
              ? "No items in your shopping list"
              : filter === "pending"
                ? "No pending items"
                : "No completed items"}
          </h3>
          <p>
            {filter === "all"
              ? "Add items manually or generate from your meal plans!"
              : filter === "pending"
                ? "All items are completed!"
                : "Complete some items to see them here."}
          </p>
        </div>
      )}
    </div>
  )
}
