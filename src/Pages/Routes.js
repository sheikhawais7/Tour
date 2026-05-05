import React from 'react'
import { Route, Routes } from 'react-router-dom'


import Home from './Home'
import Agent from './Agent'

export default function Index() {
  return (
    <>
     
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/agent' element={<Agent/>} />
      </Routes>
     
    </>
  )
}
