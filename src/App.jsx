import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/new" element={<SupplierFormPage />} />
        <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App
