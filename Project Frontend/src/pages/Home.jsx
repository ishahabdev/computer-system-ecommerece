import React from 'react'
import Slider from '../components/home/Slider'
import Cards from '../components/home/Cards'
import Category from '../components/home/Category'
import Custom from '../components/home/Custom'
import Flash from '../components/home/Flash'
import Viewed from '../components/home/Viewed'

const Home = () => {
  return (
    <div>
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
