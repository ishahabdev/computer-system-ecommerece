import React from 'react'
import { usePageSEO } from '../../hooks/usePageSEO'
import { PAGE_SEO } from '../../utils/seo'
import Slider from './components/Slider'
import Cards from './components/Cards'
import Category from './components/Category'
import Custom from './components/Custom'
import Flash from './components/Flash'
import Viewed from './components/Viewed'

const Home = () => {
  usePageSEO(PAGE_SEO.home.title, PAGE_SEO.home.description);
  
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
