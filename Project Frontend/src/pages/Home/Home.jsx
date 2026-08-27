import React, { useEffect, useState } from 'react'
import { usePageSEO } from '../../hooks/usePageSEO'
import { PAGE_SEO } from '../../utils/seo'
import { fetchProducts, getErrorMessage } from '../Shop/productApi'
import Slider from './components/Slider'
import Cards from './components/Cards'
import Category from './components/Category'
import Custom from './components/Custom'
import Flash from './components/Flash'
import Viewed from './components/Viewed'

const Home = () => {
  usePageSEO(PAGE_SEO.home.title, PAGE_SEO.home.description);

  // One fetch for the whole page. Handpicked, Categories, Flash Sale and Most
  // Viewed each derive their own slice from this same list, so admin changes to
  // the catalog show up everywhere on the next load — and we avoid four sections
  // hitting the API independently.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchProducts();
        if (active) setProducts(list);
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
          setProducts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    // Ignore an in-flight response if the page unmounts before it resolves.
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className='w-7xl'>
      <Slider />
      <Cards products={products} loading={loading} error={error} />
      <Category products={products} loading={loading} error={error} />
      <Custom />
      <Flash products={products} loading={loading} error={error} />
      <Viewed products={products} loading={loading} error={error} />
    </div>
  )
}

export default Home
