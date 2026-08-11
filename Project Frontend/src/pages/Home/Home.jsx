import React from 'react'
import Slider from './components/Slider'
import Cards from './components/Cards'
import Category from './components/Category'
import Custom from './components/Custom'
import Flash from './components/Flash'
import Viewed from './components/Viewed'

const Home = () => {
  return (
    <div className='w-7xl'>
      <Slider />
      <Cards />
      <Category />
      <Custom />
      <Flash />
      <Viewed />
     
      
    </div>
  )
}

export default Home
