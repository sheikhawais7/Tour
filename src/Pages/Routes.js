import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'


import Home from './Home'
import Agent from './Agent'
import ImageGallery from './ImageGallery'

export default function Index() {
  return (
    <>
     
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/agent' element={<Agent/>} />
        <Route path='/imageGallery' element={<ImageGallery/>} />
      </Routes>
     
    </>
  )
}
