import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../api/services'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'

export default function Shelf() {
  const { products, saveProduct, deleteProduct } = useApp()

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        filter === 'All' || product.category === filter

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.actives?.some((active) =>
          active.toLowerCase().includes(query)
        )

      return matchesCategory && matchesSearch
    })
  }, [products, filter, search])

  const onSaved = async (p) => {
    await saveProduct(p)
    setShowForm(false)
    setEditProduct(null)
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="w-full mb-5">
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            My Shelf
          </h1>

          <p className="mt-1 text-sm text-muted">
            {products.length} products · digital product shelf
          </p>
        </div>

        {/* =====================================================
            SEARCH / CATEGORY / ADD PRODUCT
        ===================================================== */}

        <div className="
          w-full
          mb-6
          grid
          grid-cols-1
          gap-3
          md:grid-cols-[minmax(0,1fr)_240px_auto]
          md:items-center
        ">

          {/* Search */}
          <div className="relative w-full min-w-0">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="box-border h-12 w-full rounded-[12px] border border-gray-300 bg-white px-4 pr-11 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-gg-600 focus:ring-4 focus:ring-gg-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="relative w-full">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter by category"
              className="box-border h-12 w-full appearance-none rounded-[10px] border border-gray-100 bg-white px-4 pr-11 text-sm font-semibold text-ink outline-none transition focus:ring-4 focus:ring-gg-500/10"
            >
              <option value="All">Categories</option>

              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gg-700">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.7 8.5h10.6c1.4 0 2.2 1.5 1.5 2.7l-5.3 9a1.7 1.7 0 0 1-3 0l-5.3-9c-.7-1.2.1-2.7 1.5-2.7Z" />
              </svg>
            </span>
          </div>

          {/* Add Product */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#427856] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(45,90,61,.18)] transition hover:-translate-y-0.5 hover:bg-[#376b4b] active:translate-y-0 md:w-auto md:min-w-[190px]"
          >
            <span className="text-[28px] font-light leading-none">
              +
            </span>

            <span>
              Add a product
            </span>
          </button>
        </div>

        {/* =====================================================
            FILTER INFO
        ===================================================== */}

        <div className="w-full mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted">
            Showing {filtered.length} of {products.length} products
          </p>

          {(filter !== 'All' || search) && (
            <button
              type="button"
              onClick={() => {
                setFilter('All')
                setSearch('')
              }}
              className="text-xs font-bold text-gg-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =====================================================
            PRODUCTS
            Own scroll area
        ===================================================== */}

        {filtered.length === 0 ? (
          <div className="w-full card p-10 text-center text-sm text-muted sm:p-12">
            {search || filter !== 'All'
              ? 'No products match your search or category.'
              : 'No products here yet. Add your first product to start building your shelf.'}
          </div>
        ) : (
          <div className="w-full h-[calc(100vh-300px)] min-h-[300px] overflow-y-auto overscroll-contain pr-2 md:h-[calc(100vh-280px)]">

            <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2">

              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="card flex min-w-0 flex-col p-5 transition hover:-translate-y-1 hover:shadow-pop"
                >

                  {/* Product Header */}
                  <div className="mb-3 flex items-start justify-between gap-3">

                    <h3 className="min-w-0 flex-1 break-words font-bold leading-snug">
                      {p.name}
                    </h3>

                    <span className="shrink-0 rounded-md bg-gg-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-gg-800">
                      {p.category}
                    </span>

                  </div>

                  {/* Actives */}
                  <p className="mb-4 break-words text-xs leading-relaxed text-muted">
                    {p.actives?.length
                      ? `Actives: ${p.actives.join(', ')}`
                      : 'No actives recorded'}
                  </p>

                  {/* Product Footer */}
                  <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <span
                      className={
                        p.timeOfDay === 'AM'
                          ? 'badge-am self-start w-fit'
                          : p.timeOfDay === 'PM'
                            ? 'badge-pm self-start w-fit'
                            : 'inline-flex w-fit self-start items-center rounded-full bg-gg-100 px-3 py-1 text-xs font-extrabold text-gg-800'
                      }
                    >
                      {p.timeOfDay}
                    </span>

                    <div className="flex w-full gap-2 sm:w-auto">

                      <button
                        type="button"
                        className="btn-outline flex-1 !px-3.5 !py-1.5 !text-xs sm:flex-none"
                        onClick={() => setEditProduct(p)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn-danger flex-1 !px-3.5 !py-1.5 !text-xs sm:flex-none"
                        onClick={() =>
                          confirm(`Delete "${p.name}"?`) &&
                          deleteProduct(p.id)
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* =====================================================
            ADD PRODUCT MODAL
        ===================================================== */}

        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Add Product"
          wide
        >
          <ProductForm
            product={null}
            onCancel={() => setShowForm(false)}
            onSaved={onSaved}
          />
        </Modal>

        {/* =====================================================
            EDIT PRODUCT MODAL
        ===================================================== */}

        <Modal
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          title="Edit Product"
          wide
        >
          {editProduct && (
            <ProductForm
              product={editProduct}
              onCancel={() => setEditProduct(null)}
              onSaved={onSaved}
            />
          )}
        </Modal>

      </div>
    </div>
  )
}
